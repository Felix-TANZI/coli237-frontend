import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  listerPartenaires,
  rejeterPartenaire,
  validerPartenaire,
  type Partenaire,
} from '../api/partenaires';
import { BarreNav, BarreNavMobile } from '../composants/BarreNav';
import { PanneauPartenaire } from '../composants/PanneauPartenaire';

function initiales(nom: string): string {
  return nom.split(' ').map((m) => m[0]).slice(0, 2).join('').toUpperCase();
}

const STATUT: Record<string, { bg: string; texte: string; cle: string; icone: string }> = {
  VALIDE: { bg: '#e8f8f3', texte: '#0F6E56', cle: 'statutValide', icone: 'ti-circle-check' },
  EN_ATTENTE: { bg: '#fdf0e3', texte: '#985a12', cle: 'statutAttente', icone: 'ti-clock' },
  REJETE: { bg: '#fdeaea', texte: '#a32d2d', cle: 'statutRejete', icone: 'ti-x' },
};

type Filtre = 'TOUS' | 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export function Partenaires() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [filtre, setFiltre] = useState<Filtre>('TOUS');
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState<Partenaire | null>(null);

  const { data: partenaires = [], isLoading } = useQuery({
    queryKey: ['partenaires'],
    queryFn: listerPartenaires,
  });

  const valider = useMutation({
    mutationFn: validerPartenaire,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['partenaires'] });
      setSelection(null);
    },
  });
  const rejeter = useMutation({
    mutationFn: rejeterPartenaire,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['partenaires'] });
      setSelection(null);
    },
  });

  const attente = partenaires.filter((p) => p.statut === 'EN_ATTENTE').length;

  const filtres = useMemo(() => {
    return partenaires
      .filter((p) => (filtre === 'TOUS' ? true : p.statut === filtre))
      .filter((p) =>
        recherche
          ? p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
            p.responsableNom.toLowerCase().includes(recherche.toLowerCase())
          : true,
      );
  }, [partenaires, filtre, recherche]);

  const CHIPS: { cle: Filtre; label: string; couleur?: string }[] = [
    { cle: 'TOUS', label: t('partenaires.tous') },
    { cle: 'EN_ATTENTE', label: t('partenaires.enAttente'), couleur: '#F28C28' },
    { cle: 'VALIDE', label: t('partenaires.valides'), couleur: '#1FB89E' },
    { cle: 'REJETE', label: t('partenaires.rejetes'), couleur: '#E24B4A' },
  ];

  return (
    <div className="min-h-screen bg-coli-craie pb-20 md:pb-0">
      <BarreNav />

      <main className="px-4 sm:px-6 py-5 sm:py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="font-extrabold text-xl sm:text-2xl text-coli-encre tracking-tight" style={{ fontFamily: 'Sora, Inter' }}>
              {t('partenaires.titre')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {t('partenaires.sousTitre', { total: partenaires.length, attente })}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 min-w-[200px]">
            <i className="ti ti-search text-gray-400 text-base" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder={t('partenaires.rechercher')}
              className="outline-none text-sm flex-1 bg-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {CHIPS.map((c) => (
            <button
              key={c.cle}
              onClick={() => setFiltre(c.cle)}
              className={`text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg border transition ${
                filtre === c.cle
                  ? 'bg-coli-encre text-white border-coli-encre'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {c.couleur && (
                <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: c.couleur }} />
              )}
              {c.label}
            </button>
          ))}
        </div>

        {/* Tableau (desktop) */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.3fr] px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span>{t('partenaires.colEntreprise')}</span>
            <span>{t('partenaires.colResponsable')}</span>
            <span>{t('partenaires.colRegion')}</span>
            <span>{t('partenaires.colStatut')}</span>
            <span className="text-right">{t('partenaires.colActions')}</span>
          </div>

          {isLoading && <p className="text-sm text-gray-400 py-8 text-center">···</p>}
          {!isLoading && filtres.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">{t('partenaires.aucun')}</p>
          )}

          {filtres.map((p) => {
            const s = STATUT[p.statut] ?? STATUT.EN_ATTENTE;
            return (
              <div key={p.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.3fr] px-5 py-3 items-center border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0 bg-coli-cyan">
                    {initiales(p.sigle ?? p.nom)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-coli-encre truncate">{p.nom}</div>
                    {p.sigle && <div className="text-xs text-gray-400 truncate">{p.sigle}</div>}
                  </div>
                </div>
                <span className="text-sm text-gray-600 truncate">{p.responsableNom}</span>
                <span className="text-sm text-gray-600">{p.ville ?? '—'}</span>
                <span>
                  <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: s.bg, color: s.texte }}>
                    <i className={`ti ${s.icone} text-[11px]`} />
                    {t(`partenaires.${s.cle}`)}
                  </span>
                </span>
                <div className="flex gap-1.5 justify-end">
                  {p.statut === 'EN_ATTENTE' && (
                    <>
                      <button onClick={() => valider.mutate(p.id)} disabled={valider.isPending} aria-label={t('partenaires.valider')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-coli-vert hover:text-white flex items-center justify-center transition">
                        <i className="ti ti-check" />
                      </button>
                      <button onClick={() => rejeter.mutate(p.id)} disabled={rejeter.isPending} aria-label={t('partenaires.rejeter')} className="w-8 h-8 rounded-lg bg-red-50 text-red-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition">
                        <i className="ti ti-x" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelection(p)} aria-label="Détails" className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-coli-encre hover:text-white flex items-center justify-center transition">
                    <i className="ti ti-eye" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cartes (mobile) */}
        <div className="md:hidden space-y-2.5">
          {filtres.map((p) => {
            const s = STATUT[p.statut] ?? STATUT.EN_ATTENTE;
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-3.5" onClick={() => setSelection(p)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0 bg-coli-cyan">
                    {initiales(p.sigle ?? p.nom)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-coli-encre truncate">{p.nom}</div>
                    <div className="text-xs text-gray-400 truncate">{p.responsableNom} · {p.ville ?? '—'}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1" style={{ background: s.bg, color: s.texte }}>
                    <i className={`ti ${s.icone} text-[10px]`} />
                    {t(`partenaires.${s.cle}`)}
                  </span>
                </div>
                {p.statut === 'EN_ATTENTE' && (
                  <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => valider.mutate(p.id)} className="flex-1 py-2 rounded-lg bg-coli-vert text-white text-xs font-semibold flex items-center justify-center gap-1">
                      <i className="ti ti-check" />{t('partenaires.valider')}
                    </button>
                    <button onClick={() => rejeter.mutate(p.id)} className="flex-1 py-2 rounded-lg border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-center gap-1">
                      <i className="ti ti-x" />{t('partenaires.rejeter')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          {filtres.length} {t('partenaires.sur')} {partenaires.length}
        </p>
      </main>

      <BarreNavMobile />

      {selection && (
        <PanneauPartenaire
          partenaire={selection}
          onFermer={() => setSelection(null)}
          onValider={() => valider.mutate(selection.id)}
          onRejeter={() => rejeter.mutate(selection.id)}
          enCours={valider.isPending || rejeter.isPending}
        />
      )}
    </div>
  );
}