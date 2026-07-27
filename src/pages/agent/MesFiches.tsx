import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mesFiches } from '../../api/espaceAgent';
import { NavAgentBas, NavAgentHaut } from '../../composants/NavAgent';
import { agentConnecte } from '../../api/auth';

function couleurAvatar(nom: string): string {
  const c = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let s = 0;
  for (const ch of nom) s += ch.charCodeAt(0);
  return c[s % c.length];
}
function initiales(nom: string): string {
  return nom.split(' ').map((m) => m[0]).slice(0, 2).join('').toUpperCase();
}

const STATUT: Record<string, { bg: string; texte: string; cle: string; icone: string }> = {
  VALIDE: { bg: '#e8f8f3', texte: '#0F6E56', cle: 'statutValide', icone: 'ti-circle-check' },
  EN_ATTENTE: { bg: '#fdf0e3', texte: '#985a12', cle: 'statutAttente', icone: 'ti-clock' },
  REJETE: { bg: '#fdeaea', texte: '#a32d2d', cle: 'statutRejete', icone: 'ti-x' },
};

type Filtre = 'TOUS' | 'coursier' | 'partenaire' | 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

export function MesFiches() {
  const { t } = useTranslation();
  const moi = agentConnecte();
  const [filtre, setFiltre] = useState<Filtre>('TOUS');
  const [recherche, setRecherche] = useState('');

  const { data: fiches = [], isLoading } = useQuery({
    queryKey: ['mesFiches'],
    queryFn: mesFiches,
  });

  const filtrees = useMemo(() => {
    return fiches
      .filter((f) => {
        if (filtre === 'TOUS') return true;
        if (filtre === 'coursier' || filtre === 'partenaire') return f.categorie === filtre;
        return f.statut === filtre;
      })
      .filter((f) =>
        recherche ? f.nom.toLowerCase().includes(recherche.toLowerCase()) : true,
      );
  }, [fiches, filtre, recherche]);

  const CHIPS: { cle: Filtre; label: string }[] = [
    { cle: 'TOUS', label: t('mesFiches.tous') },
    { cle: 'coursier', label: t('mesFiches.coursiers') },
    { cle: 'partenaire', label: t('mesFiches.partenaires') },
    { cle: 'EN_ATTENTE', label: t('mesFiches.attente') },
    { cle: 'VALIDE', label: t('mesFiches.valides') },
  ];

  return (
    <div className="min-h-screen bg-coli-craie pb-24 md:pb-0">
      <NavAgentHaut nom={moi?.nom ?? 'Agent'} />

      <div className="max-w-3xl mx-auto px-4 py-5 md:px-6 md:py-6">
        {/* En-tête */}
        <div className="mb-4">
          <h1 className="font-extrabold text-xl md:text-2xl text-coli-encre tracking-tight" style={{ fontFamily: 'Sora, Inter' }}>
            {t('mesFiches.titre')}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">
            {t('mesFiches.sousTitre', { total: fiches.length })}
          </p>
        </div>

        {/* Recherche */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-3" style={{ boxShadow: OMBRE }}>
          <i className="ti ti-search text-gray-400 text-base" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t('mesFiches.rechercher')}
            className="outline-none text-sm flex-1 bg-transparent"
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {CHIPS.map((c) => (
            <button
              key={c.cle}
              onClick={() => setFiltre(c.cle)}
              className={`text-xs font-medium px-3.5 py-2 rounded-lg border whitespace-nowrap transition ${
                filtre === c.cle
                  ? 'bg-coli-encre text-white border-coli-encre'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {isLoading && <p className="text-sm text-gray-400 py-8 text-center">···</p>}

        {!isLoading && fiches.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/70 p-8 text-center" style={{ boxShadow: OMBRE }}>
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <i className="ti ti-clipboard-list text-2xl" />
            </div>
            <p className="text-sm text-gray-500">{t('mesFiches.aucun')}</p>
          </div>
        )}

        {!isLoading && fiches.length > 0 && filtrees.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">{t('mesFiches.aucunFiltre')}</p>
        )}

        {filtrees.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/70 overflow-hidden" style={{ boxShadow: OMBRE }}>
            {filtrees.map((f) => {
              const s = STATUT[f.statut] ?? STATUT.EN_ATTENTE;
              return (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-none hover:bg-gray-50/60 transition">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: couleurAvatar(f.nom) }}>
                    {initiales(f.nom)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-coli-encre truncate">{f.nom}</div>
                    <div className="text-xs text-gray-400 truncate flex items-center gap-1.5">
                      <i className={`ti ${f.categorie === 'coursier' ? 'ti-motorbike' : 'ti-building-store'} text-xs`} />
                      {f.type} · {f.lieu}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0" style={{ background: s.bg, color: s.texte }}>
                    <i className={`ti ${s.icone} text-[11px]`} />
                    {t(`mesFiches.${s.cle}`)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NavAgentBas />
    </div>
  );
}