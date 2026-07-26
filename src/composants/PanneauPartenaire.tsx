import { useTranslation } from 'react-i18next';
import type { Partenaire } from '../api/partenaires';

const LIBELLE_DOC: Record<string, string> = {
  REGISTRE_COMMERCE: 'Registre commerce',
  AUTRE: 'Autre',
};

function initiales(nom: string): string {
  return nom.split(' ').map((m) => m[0]).slice(0, 2).join('').toUpperCase();
}

export function PanneauPartenaire({
  partenaire,
  onFermer,
  onValider,
  onRejeter,
  enCours,
}: {
  partenaire: Partenaire;
  onFermer: () => void;
  onValider: () => void;
  onRejeter: () => void;
  enCours: boolean;
}) {
  const { t } = useTranslation();
  const enAttente = partenaire.statut === 'EN_ATTENTE';
  const nbCoursiers = partenaire.coursiers?.length ?? 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onFermer} aria-hidden="true" />
      <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-[360px] bg-white shadow-2xl z-50 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {t('partenaires.fiche')}
          </span>
          <button onClick={onFermer} aria-label="Fermer" className="text-gray-400 hover:text-coli-encre">
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-semibold text-white mb-2.5 bg-coli-cyan">
            {initiales(partenaire.sigle ?? partenaire.nom)}
          </div>
          <div className="font-extrabold text-lg text-coli-encre" style={{ fontFamily: 'Sora, Inter' }}>
            {partenaire.nom}
          </div>
          {partenaire.sigle && (
            <div className="text-xs text-gray-400 mt-0.5">{partenaire.sigle}</div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-3.5 mb-3.5 space-y-1">
          <Ligne label={t('partenaires.responsable')} valeur={`${partenaire.responsableNom} · ${partenaire.responsableTelephone}`} />
          <Ligne label={t('partenaires.region')} valeur={[partenaire.ville, partenaire.quartier].filter(Boolean).join(' · ') || '—'} />
          {partenaire.niu && <Ligne label={t('partenaires.niu')} valeur={partenaire.niu} />}
          {partenaire.registreCommerce && <Ligne label={t('partenaires.registre')} valeur={partenaire.registreCommerce} />}
          <Ligne label={t('partenaires.coursiersRattaches')} valeur={String(nbCoursiers)} />
          {partenaire.mobileMoneyNumero && (
            <Ligne label={t('partenaires.mobileMoney')} valeur={`${partenaire.mobileMoneyNumero}${partenaire.mobileMoneyOperateur ? ' · ' + partenaire.mobileMoneyOperateur : ''}`} />
          )}
        </div>

        {partenaire.documents && partenaire.documents.length > 0 && (
          <>
            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">
              {t('partenaires.documents')}
            </div>
            {partenaire.documents.map((d) => (
              <div key={d.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-coli-cyan flex items-center justify-center">
                  <i className="ti ti-file text-base" />
                </div>
                <div className="flex-1 text-xs font-medium text-coli-encre">
                  {LIBELLE_DOC[d.type] ?? d.type}
                </div>
                <a href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/${d.chemin}`} target="_blank" rel="noreferrer" className="text-coli-cyan" aria-label="Voir">
                  <i className="ti ti-eye" />
                </a>
              </div>
            ))}
          </>
        )}

        {enAttente && (
          <div className="flex gap-2.5 mt-5">
            <button onClick={onValider} disabled={enCours} className="flex-1 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-60 transition">
              <i className="ti ti-check" />
              {t('partenaires.valider')}
            </button>
            <button onClick={onRejeter} disabled={enCours} className="flex-1 py-2.5 rounded-xl border border-red-200 bg-white text-red-700 font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-red-50 disabled:opacity-60 transition">
              <i className="ti ti-x" />
              {t('partenaires.rejeter')}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm gap-2">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-coli-encre font-medium text-right">{valeur}</span>
    </div>
  );
}