import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import {
  archiverPersonne,
  listerPersonnes,
  rejeterPersonne,
  urlDocument,
  validerPersonne,
  type Personne,
} from '../../api/personnes';
import { LISTE_ROLES, ROLES } from '../../composants/roles';
import { BarreNav, BarreNavMobile } from '../../composants/BarreNav';
import { ModaleUtilisateur } from './ModaleUtilisateur';

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

const STATUTS: Record<string, { cle: string; bg: string; texte: string; icone: string }> = {
  EN_ATTENTE: { cle: 'EN_ATTENTE', bg: '#fdf0e3', texte: '#985a12', icone: 'ti-clock' },
  VALIDE: { cle: 'VALIDE', bg: '#e8f8f3', texte: '#0F6E56', icone: 'ti-circle-check' },
  REJETE: { cle: 'REJETE', bg: '#fdeaea', texte: '#a32d2d', icone: 'ti-x' },
};

function couleurAvatar(nom: string): string {
  const c = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let s = 0;
  for (const ch of nom) s += ch.charCodeAt(0);
  return c[s % c.length];
}
function initiales(prenom: string, nom: string): string {
  return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase();
}
function formaterTel(tel: string): string {
  const n = tel.replace(/^\+237/, '').replace(/\s/g, '');
  if (n.length === 0) return tel;
  return `+237 ${n[0]} ${n.slice(1).replace(/(\d{2})(?=\d)/g, '$1 ')}`.trim();
}
// Libelle traduit d'un type de vehicule (repli : la valeur brute).
function libelleVehicule(t: TFunction, type: string): string {
  return t(`vehicules.${type}`, { defaultValue: type.replace('_', ' ') });
}

function sousTitre(p: Personne, t: TFunction): string {
  if (p.role === 'LIVREUR_INDEPENDANT' || p.role === 'LIVREUR_AGENCE') {
    const veh = p.typeVehicule ? libelleVehicule(t, p.typeVehicule) : '';
    return [veh, p.compagnie?.nom ?? p.ville].filter(Boolean).join(' - ');
  }
  return p.ville ?? '-';
}

export function Utilisateurs() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [detail, setDetail] = useState<Personne | null>(null);
  const [docEnCours, setDocEnCours] = useState<string | null>(null);

  const { data: personnes = [], isLoading } = useQuery({
    queryKey: ['personnes'],
    queryFn: () => listerPersonnes(),
  });

  const valider = useMutation({
    mutationFn: (id: string) => validerPersonne(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['personnes'] }),
  });
  const rejeter = useMutation({
    mutationFn: (id: string) => rejeterPersonne(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['personnes'] }),
  });
  const archiver = useMutation({
    mutationFn: (id: string) => archiverPersonne(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['personnes'] });
      setDetail(null);
    },
  });

  // Ouvre un document via une URL signee temporaire.
  const ouvrirDocument = async (documentId: string) => {
    if (!detail) return;
    setDocEnCours(documentId);
    try {
      const url = await urlDocument(detail.id, documentId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      alert(t('utilisateurs.docErreur'));
    } finally {
      setDocEnCours(null);
    }
  };

  const filtrees = useMemo(() => {
    return personnes
      .filter((p) => (filtreRole ? p.role === filtreRole : true))
      .filter((p) => (filtreStatut ? p.statut === filtreStatut : true))
      .filter((p) => {
        if (!recherche) return true;
        const t = recherche.toLowerCase();
        return `${p.prenom} ${p.nom}`.toLowerCase().includes(t) || p.telephone.includes(t);
      });
  }, [personnes, filtreRole, filtreStatut, recherche]);

  return (
    <div className="min-h-screen bg-coli-craie pb-20 md:pb-0">
      <BarreNav />
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6">
        {/* En-tete */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1
              className="font-extrabold text-2xl text-coli-encre tracking-tight"
              style={{ fontFamily: 'Sora, Inter' }}
            >
              {t('utilisateurs.titre')}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t('utilisateurs.sousTitre', { count: personnes.length })}
            </p>
          </div>
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-coli-orange text-white rounded-xl px-4 py-2.5 font-semibold text-sm flex items-center gap-2 hover:bg-orange-600 transition"
            style={{ boxShadow: '0 6px 16px rgba(242,140,40,.3)' }}
          >
            <i className="ti ti-plus" />
            <span className="hidden sm:inline">{t('utilisateurs.nouveau')}</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 mb-5">
          <div
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 flex-1"
            style={{ boxShadow: OMBRE }}
          >
            <i className="ti ti-search text-gray-400" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder={t('utilisateurs.rechercher')}
              className="outline-none text-sm flex-1 bg-transparent"
            />
          </div>

          <div className="relative md:w-52">
            <i className="ti ti-user-circle absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filtreRole}
              onChange={(e) => setFiltreRole(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-coli-encre outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 transition"
              style={{ boxShadow: OMBRE }}
            >
              <option value="">{t('utilisateurs.tousRoles')}</option>
              {LISTE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`roles.${r}`)}
                </option>
              ))}
            </select>
            <i className="ti ti-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
          </div>

          <div className="relative md:w-44">
            <i className="ti ti-filter absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-coli-encre outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 transition"
              style={{ boxShadow: OMBRE }}
            >
              <option value="">{t('utilisateurs.tousStatuts')}</option>
              <option value="EN_ATTENTE">{t('statuts.EN_ATTENTE')}</option>
              <option value="VALIDE">{t('statuts.VALIDE')}</option>
              <option value="REJETE">{t('statuts.REJETE')}</option>
            </select>
            <i className="ti ti-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
          </div>
        </div>

        {/* Tableau desktop */}
        <div
          className="hidden md:block bg-white rounded-2xl border border-gray-200/70 overflow-hidden"
          style={{ boxShadow: OMBRE }}
        >
          <div className="grid grid-cols-[2fr_1.3fr_1.3fr_1.2fr_1fr_auto] gap-3 px-5 py-3 bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <div>{t('utilisateurs.colNom')}</div>
            <div>{t('utilisateurs.colTelephone')}</div>
            <div>{t('utilisateurs.colRole')}</div>
            <div>{t('utilisateurs.colRecensePar')}</div>
            <div>{t('utilisateurs.colStatut')}</div>
            <div></div>
          </div>
          {isLoading && <div className="px-5 py-8 text-center text-gray-400 text-sm">...</div>}
          {!isLoading && filtrees.length === 0 && (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              {t('utilisateurs.aucune')}
            </div>
          )}
          {filtrees.map((p) => {
            const info = ROLES[p.role];
            const st = STATUTS[p.statut] ?? STATUTS.EN_ATTENTE;
            return (
              <div
                key={p.id}
                className="grid grid-cols-[2fr_1.3fr_1.3fr_1.2fr_1fr_auto] gap-3 px-5 py-3 border-b border-gray-50 last:border-none items-center hover:bg-gray-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0"
                    style={{ background: couleurAvatar(p.nom) }}
                  >
                    {initiales(p.prenom, p.nom)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-coli-encre truncate">
                      {p.prenom} {p.nom}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">{sousTitre(p, t)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{formaterTel(p.telephone)}</div>
                <div>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: info.fond, color: info.couleur }}
                  >
                    {t(`roles.${p.role}`)}
                  </span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <i className="ti ti-user-shield text-gray-300 text-sm shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{p.agent?.nom ?? '-'}</span>
                </div>
                <div>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                    style={{ background: st.bg, color: st.texte }}
                  >
                    <i className={`ti ${st.icone} text-[11px]`} />
                    {t(`statuts.${st.cle}`)}
                  </span>
                </div>
                <button
                  onClick={() => setDetail(p)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center transition"
                >
                  <i className="ti ti-dots-vertical" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Cartes mobile */}
        <div className="md:hidden space-y-2.5">
          {filtrees.map((p) => {
            const info = ROLES[p.role];
            const st = STATUTS[p.statut] ?? STATUTS.EN_ATTENTE;
            return (
              <button
                key={p.id}
                onClick={() => setDetail(p)}
                className="w-full bg-white rounded-2xl border border-gray-200/70 p-4 text-left"
                style={{ boxShadow: OMBRE }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white shrink-0"
                    style={{ background: couleurAvatar(p.nom) }}
                  >
                    {initiales(p.prenom, p.nom)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-coli-encre truncate">
                      {p.prenom} {p.nom}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {formaterTel(p.telephone)}
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0"
                    style={{ background: st.bg, color: st.texte }}
                  >
                    <i className={`ti ${st.icone} text-[11px]`} />
                    {t(`statuts.${st.cle}`)}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: info.fond, color: info.couleur }}
                  >
                    {t(`roles.${p.role}`)}
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <i className="ti ti-user-shield" />
                    {p.agent?.nom ?? '-'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal creation */}
        {modalOuvert && <ModaleUtilisateur onFermer={() => setModalOuvert(false)} />}

        {/* Panneau detail */}
        {detail && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setDetail(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: '0 20px 60px rgba(14,26,36,.25)' }}
            >
              <div className="p-5 border-b border-gray-100 flex items-center gap-3 sticky top-0 bg-white">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-semibold text-white"
                  style={{ background: couleurAvatar(detail.nom) }}
                >
                  {initiales(detail.prenom, detail.nom)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-coli-encre">
                    {detail.prenom} {detail.nom}
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: ROLES[detail.role].fond, color: ROLES[detail.role].couleur }}
                  >
                    {t(`roles.${detail.role}`)}
                  </span>
                </div>
                <button
                  onClick={() => setDetail(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center"
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <div className="p-5 space-y-2 text-sm">
                <Ligne
                  label={t('utilisateurs.detailTelephone')}
                  valeur={formaterTel(detail.telephone)}
                />
                {detail.email && (
                  <Ligne label={t('utilisateurs.detailEmail')} valeur={detail.email} />
                )}
                {detail.ville && (
                  <Ligne label={t('utilisateurs.detailVille')} valeur={detail.ville} />
                )}
                {detail.compagnie && (
                  <Ligne label={t('utilisateurs.detailCompagnie')} valeur={detail.compagnie.nom} />
                )}
                {detail.typeVehicule && (
                  <Ligne
                    label={t('utilisateurs.detailVehicule')}
                    valeur={libelleVehicule(t, detail.typeVehicule)}
                  />
                )}
                {detail.plaque && (
                  <Ligne label={t('utilisateurs.detailPlaque')} valeur={detail.plaque} />
                )}
                <Ligne
                  label={t('utilisateurs.detailRecensePar')}
                  valeur={detail.agent?.nom ?? t('utilisateurs.inconnu')}
                />
              </div>

              {/* Documents joints */}
              <div className="px-5 pb-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {t('utilisateurs.documents')} ({detail.documents?.length ?? 0})
                </div>
                {!detail.documents || detail.documents.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">{t('utilisateurs.aucunDocument')}</p>
                ) : (
                  <div className="space-y-2">
                    {detail.documents.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => ouvrirDocument(d.id)}
                        disabled={docEnCours === d.id}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-left disabled:opacity-50"
                      >
                        <div className="w-9 h-9 rounded-lg bg-coli-cyan/10 text-coli-cyan flex items-center justify-center shrink-0">
                          <i className="ti ti-file-text text-lg" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-coli-encre truncate">
                            {t(`typesDocument.${d.type}`, { defaultValue: d.type })}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {d.nomOriginal ?? t('utilisateurs.document')}
                          </div>
                        </div>
                        {docEnCours === d.id ? (
                          <i className="ti ti-loader-2 animate-spin text-gray-400" />
                        ) : (
                          <i className="ti ti-download text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {detail.statut !== 'VALIDE' && (
                <div className="p-5 border-t border-gray-100 flex gap-2.5">
                  <button
                    onClick={() => {
                      rejeter.mutate(detail.id);
                      setDetail(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition"
                  >
                    {t('commun.rejeter')}
                  </button>
                  <button
                    onClick={() => {
                      valider.mutate(detail.id);
                      setDetail(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm hover:bg-emerald-600 transition"
                  >
                    {t('commun.valider')}
                  </button>
                </div>
              )}
              <div className="px-5 pb-4">
                <button
                  onClick={() => archiver.mutate(detail.id)}
                  className="w-full py-2 text-xs text-gray-400 hover:text-red-500 transition"
                >
                  {t('utilisateurs.archiverFiche')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <BarreNavMobile />
    </div>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-none">
      <span className="text-gray-400">{label}</span>
      <span className="text-coli-encre font-medium">{valeur}</span>
    </div>
  );
}