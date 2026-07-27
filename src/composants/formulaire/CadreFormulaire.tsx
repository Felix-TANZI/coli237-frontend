import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function CadreFormulaire({
  titre,
  etapes,
  etapeCourante,
  peutContinuer,
  enCours,
  estDerniere,
  panneauContexte,
  onPrecedent,
  onSuivant,
  children,
}: {
  titre: string;
  etapes: string[];
  etapeCourante: number;
  peutContinuer: boolean;
  enCours: boolean;
  estDerniere: boolean;
  panneauContexte?: ReactNode;
  onPrecedent: () => void;
  onSuivant: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const total = etapes.length;

  const retour = () => {
    if (etapeCourante === 0) navigate('/agent');
    else onPrecedent();
  };

  return (
    <div className="min-h-screen bg-coli-craie">
      <div className="max-w-6xl mx-auto px-4 py-5 md:px-6 md:py-7">
        {/* En-tête */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={retour}
            aria-label={t('recensement.retour')}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 transition shrink-0"
          >
            <i className="ti ti-arrow-left text-lg" />
          </button>
          <div>
            <div className="font-extrabold text-lg md:text-xl text-coli-encre" style={{ fontFamily: 'Sora, Inter' }}>
              {titre}
            </div>
            <div className="text-[11px] md:text-xs text-gray-400">
              {t('recensement.etapeSur', { n: etapeCourante + 1, total })} · {etapes[etapeCourante]}
            </div>
          </div>
        </div>

        {/* Frise horizontale — desktop */}
        <div className="hidden md:flex items-center max-w-2xl mx-auto mb-7">
          {etapes.map((nomEtape, i) => {
            const fait = i < etapeCourante;
            const courant = i === etapeCourante;
            return (
              <div key={i} className="flex items-center" style={{ flex: i < total - 1 ? 1 : '0 0 auto' }}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                      fait
                        ? 'bg-coli-vert text-white'
                        : courant
                          ? 'bg-coli-encre text-white'
                          : 'bg-white text-gray-300 border-2 border-gray-200'
                    }`}
                    style={courant ? { boxShadow: '0 0 0 4px rgba(14,26,36,.1)' } : undefined}
                  >
                    {fait ? <i className="ti ti-check" /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-medium whitespace-nowrap ${courant ? 'text-coli-encre' : fait ? 'text-gray-500' : 'text-gray-300'}`}>
                    {nomEtape}
                  </span>
                </div>
                {i < total - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all" style={{ background: fait ? '#1FB89E' : '#e2e8ec' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Barre de progression — mobile */}
        <div className="md:hidden flex gap-1.5 mb-6">
          {etapes.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all"
              style={{ background: i < etapeCourante ? '#1FB89E' : i === etapeCourante ? '#F28C28' : '#dde3e8' }}
            />
          ))}
        </div>

        {/* Corps : formulaire + panneau contexte */}
        <div className={`grid gap-5 ${panneauContexte ? 'md:grid-cols-[1fr_340px]' : 'max-w-2xl mx-auto'}`}>
          {/* Carte formulaire */}
          <div
            key={etapeCourante}
            className="ag-anim bg-white rounded-2xl border border-gray-200/70 p-5 md:p-7"
            style={{ boxShadow: '0 1px 3px rgba(14,26,36,.04), 0 8px 24px rgba(14,26,36,.06)' }}
          >
            {children}
          </div>

          {/* Panneau contexte — seulement si fourni (desktop en colonne, mobile dessous) */}
          {panneauContexte && <div className="order-first md:order-none">{panneauContexte}</div>}
        </div>

        {/* Boutons navigation */}
        <div className={`flex justify-between mt-6 ${panneauContexte ? 'md:max-w-[calc(100%-360px)]' : 'max-w-2xl mx-auto'}`}>
          {etapeCourante > 0 ? (
            <button
              onClick={onPrecedent}
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-semibold text-sm flex items-center gap-2 hover:bg-gray-50 transition"
            >
              <i className="ti ti-arrow-left" />
              <span className="hidden sm:inline">{t('recensement.precedent')}</span>
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onSuivant}
            disabled={!peutContinuer || enCours}
            className="px-6 py-3 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
            style={{ boxShadow: '0 6px 16px rgba(31,184,158,.3)' }}
          >
            {enCours ? (
              <>
                <i className="ti ti-loader-2 animate-spin" />
                {t('recensement.envoi')}
              </>
            ) : estDerniere ? (
              <>
                <i className="ti ti-check" />
                {t('recensement.enregistrer')}
              </>
            ) : (
              <>
                {t('recensement.continuer')}
                <i className="ti ti-arrow-right" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}