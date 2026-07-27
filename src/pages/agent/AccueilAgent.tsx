import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { agentConnecte } from '../../api/auth';
import { mesRecensements, OBJECTIF_JOUR } from '../../api/espaceAgent';
import { AnneauObjectif } from '../../composants/AnneauObjectif';
import { CompteurAnime } from '../../composants/CompteurAnime';
import { NavAgentBas, NavAgentHaut } from '../../composants/NavAgent';
import { useEnLigne } from '../../composants/useEnLigne';

function couleurAvatar(nom: string): string {
  const c = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let s = 0;
  for (const ch of nom) s += ch.charCodeAt(0);
  return c[s % c.length];
}
function initiales(nom: string): string {
  return nom.split(' ').map((m) => m[0]).slice(0, 2).join('').toUpperCase();
}
function cleSalutation(): string {
  const h = new Date().getHours();
  if (h < 12) return 'bonjourMatin';
  if (h < 18) return 'bonjourApresMidi';
  return 'bonjourSoir';
}

const STATUT: Record<string, { bg: string; texte: string; cle: string; icone: string }> = {
  VALIDE: { bg: '#e8f8f3', texte: '#0F6E56', cle: 'statutValide', icone: 'ti-circle-check' },
  EN_ATTENTE: { bg: '#fdf0e3', texte: '#985a12', cle: 'statutAttente', icone: 'ti-clock' },
  REJETE: { bg: '#fdeaea', texte: '#a32d2d', cle: 'statutRejete', icone: 'ti-x' },
};

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

export function AccueilAgent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const enLigne = useEnLigne();
  const moi = agentConnecte();
  const nom = moi?.nom ?? 'Agent';

  const { data } = useQuery({
    queryKey: ['mesRecensements'],
    queryFn: mesRecensements,
  });

  const maxRythme = Math.max(1, ...(data?.rythme.map((r) => r.nombre) ?? [1]));

  return (
    <div className="min-h-screen bg-coli-craie pb-24 md:pb-0">
      <NavAgentHaut nom={nom} />

      <div className="max-w-md md:max-w-5xl mx-auto md:px-6 md:py-6">
        {/* En-tête avec anneau d'objectif */}
        <header
          className="ag-anim ag-d1 px-4 pt-6 pb-8 md:p-6 md:rounded-2xl text-white relative overflow-hidden md:flex md:items-center md:justify-between md:gap-6 md:mb-4"
          style={{ background: 'linear-gradient(135deg,#0E1A24,#16334a)', boxShadow: '0 8px 24px rgba(14,26,36,.18)' }}
        >
          <div className="flex items-center gap-4 relative z-10">
            <AnneauObjectif fait={data?.ceJour ?? 0} objectif={OBJECTIF_JOUR} />
            <div>
              <div className="text-xs text-white/55">{t(`agent.${cleSalutation()}`)},</div>
              <div className="font-extrabold text-xl md:text-2xl" style={{ fontFamily: 'Sora, Inter' }}>
                {nom}
              </div>
              {/* État en ligne / hors-ligne */}
              {enLigne ? (
                <div className="flex items-center gap-1.5 mt-2 w-fit text-xs rounded-lg px-2.5 py-1" style={{ background: 'rgba(31,184,158,.15)', border: '1px solid rgba(31,184,158,.3)', color: '#5DCAA5' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-coli-vert ag-pulse" />
                  {t('agent.enLigne')}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2 w-fit text-xs rounded-lg px-2.5 py-1" style={{ background: 'rgba(226,75,74,.15)', border: '1px solid rgba(226,75,74,.35)', color: '#F0997B' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E24B4A' }} />
                  {t('agent.horsLigne')}
                </div>
              )}
            </div>
          </div>

          {/* Stats (PC) */}
          <div className="hidden md:flex gap-6 relative z-10">
            <StatHero valeur={data?.recenses ?? 0} label={t('agent.recenses')} couleur="#5DCAA5" />
            <StatHero valeur={data?.attente ?? 0} label={t('agent.enAttente')} couleur="#F5B87A" />
            <StatHero valeur={data?.valides ?? 0} label={t('agent.valides')} couleur="#fff" />
          </div>

          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#1FB89E,transparent 70%)' }} />
        </header>

        <div className="px-4 md:px-0">
          {/* Stats (mobile) */}
          <div className="grid grid-cols-3 gap-2 -mt-6 relative z-10 md:hidden">
            <StatCarte valeur={data?.recenses ?? 0} label={t('agent.recenses')} couleur="#1FB89E" />
            <StatCarte valeur={data?.attente ?? 0} label={t('agent.enAttente')} couleur="#F28C28" />
            <StatCarte valeur={data?.valides ?? 0} label={t('agent.valides')} couleur="#17A2B8" />
          </div>

          {/* Actions rapides + rythme */}
          <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_320px] gap-3 mt-4">
            <button
              onClick={() => navigate('/agent/recenser?type=coursier')}
              className="ag-anim ag-d2 rounded-2xl p-4 md:p-5 text-white text-left flex flex-col justify-between min-h-[120px] hover:-translate-y-0.5 transition-transform"
              style={{ background: 'linear-gradient(135deg,#1FB89E,#17A2B8)', boxShadow: '0 8px 22px rgba(31,184,158,.3)' }}
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                <i className="ti ti-motorbike" />
              </div>
              <div>
                <div className="font-semibold text-sm md:text-base">{t('agent.recenserCoursier')}</div>
                <div className="text-[11px] text-white/75 mt-0.5">{t('agent.coursierFreelance')}</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/agent/recenser?type=partenaire')}
              className="ag-anim ag-d2 rounded-2xl p-4 md:p-5 text-white text-left flex flex-col justify-between min-h-[120px] hover:-translate-y-0.5 transition-transform"
              style={{ background: 'linear-gradient(135deg,#F28C28,#e07d1c)', boxShadow: '0 8px 22px rgba(242,140,40,.3)' }}
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                <i className="ti ti-building-store" />
              </div>
              <div>
                <div className="font-semibold text-sm md:text-base">{t('agent.recenserEntreprise')}</div>
                <div className="text-[11px] text-white/80 mt-0.5">{t('agent.partenaireLivraison')}</div>
              </div>
            </button>

            {/* Rythme hebdo — pleine largeur sur mobile */}
            <div className="ag-anim ag-d3 col-span-2 md:col-span-1 bg-white rounded-2xl border border-gray-200/70 p-4" style={{ boxShadow: OMBRE }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-coli-encre">{t('agent.monRythme')}</span>
                <span className="text-xs text-gray-400">{t('agent.septJours')}</span>
              </div>
              <div className="flex items-end gap-1.5 h-16 mt-3">
                {data?.rythme.map((r, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t transition-all duration-700"
                      style={{
                        height: `${Math.max((r.nombre / maxRythme) * 100, 6)}%`,
                        background: r.estAujourdhui ? '#F28C28' : '#1FB89E',
                        minHeight: '4px',
                      }}
                      title={`${r.nombre}`}
                    />
                    <span className={`text-[9px] ${r.estAujourdhui ? 'text-coli-orange font-semibold' : 'text-gray-400'}`}>
                      {r.jour}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mes derniers recensements — en LISTE */}
          <div className="ag-anim ag-d4 mt-5">
            <div className="text-sm font-semibold text-coli-encre mb-2.5 px-0.5">
              {t('agent.mesDerniers')}
            </div>

            {data && data.recents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/70 p-8 text-center" style={{ boxShadow: OMBRE }}>
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <i className="ti ti-clipboard-list text-2xl" />
                </div>
                <p className="text-sm text-gray-500">{t('agent.aucunRecensement')}</p>
                <p className="text-xs text-gray-400 mt-1">{t('agent.commencer')}</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/70 overflow-hidden" style={{ boxShadow: OMBRE }}>
                {data?.recents.map((r) => {
                  const s = STATUT[r.statut] ?? STATUT.EN_ATTENTE;
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-none hover:bg-gray-50/60 transition">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: couleurAvatar(r.nom) }}>
                        {initiales(r.nom)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-coli-encre truncate">{r.nom}</div>
                        <div className="text-xs text-gray-400 truncate">{r.type} · {r.lieu}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0" style={{ background: s.bg, color: s.texte }}>
                        <i className={`ti ${s.icone} text-[11px]`} />
                        {t(`agent.${s.cle}`)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <NavAgentBas />
    </div>
  );
}

function StatHero({ valeur, label, couleur }: { valeur: number; label: string; couleur: string }) {
  return (
    <div>
      <div className="font-extrabold text-3xl leading-none" style={{ color: couleur, fontFamily: 'Sora, Inter' }}>
        <CompteurAnime valeur={valeur} />
      </div>
      <div className="text-xs text-white/55 mt-1">{label}</div>
    </div>
  );
}

function StatCarte({ valeur, label, couleur }: { valeur: number; label: string; couleur: string }) {
  return (
    <div className="ag-anim ag-d2 bg-white rounded-xl p-2.5 border border-gray-200/70" style={{ boxShadow: OMBRE }}>
      <div className="font-extrabold text-xl leading-none" style={{ color: couleur, fontFamily: 'Sora, Inter' }}>
        <CompteurAnime valeur={valeur} />
      </div>
      <div className="text-[10px] text-gray-400 mt-1">{label}</div>
    </div>
  );
}