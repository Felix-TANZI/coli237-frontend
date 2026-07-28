import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { agentConnecte, changerMotDePasse, seDeconnecter } from '../../api/auth';
import { mesRecensements } from '../../api/espaceAgent';
import { NavAgentBas, NavAgentHaut } from '../../composants/NavAgent';
import { SelecteurLangue } from '../../composants/SelecteurLangue';

function couleurAvatar(nom: string): string {
  const c = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let s = 0;
  for (const ch of nom) s += ch.charCodeAt(0);
  return c[s % c.length];
}
function initiales(nom: string): string {
  return nom
    .split(' ')
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

export function Profil() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const moi = agentConnecte();
  const nom = moi?.nom ?? 'Agent';
  const [confirmer, setConfirmer] = useState(false);
  const [mdpOuvert, setMdpOuvert] = useState(false);

  const { data } = useQuery({
    queryKey: ['mesRecensements'],
    queryFn: mesRecensements,
  });

  const deconnexion = () => {
    seDeconnecter();
    navigate('/connexion');
  };

  return (
    <div className="min-h-screen bg-coli-craie pb-24 md:pb-0">
      <NavAgentHaut nom={nom} />

      <div className="max-w-2xl mx-auto px-4 py-5 md:px-6 md:py-6">
        {/* Carte identité */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden mb-4"
          style={{
            background: 'linear-gradient(135deg,#0E1A24,#16334a)',
            boxShadow: '0 8px 24px rgba(14,26,36,.18)',
          }}
        >
          <div className="relative z-10 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
              style={{ background: couleurAvatar(nom) }}
            >
              {initiales(nom)}
            </div>
            <div>
              <div className="font-extrabold text-xl" style={{ fontFamily: 'Sora, Inter' }}>
                {nom}
              </div>
              <div className="text-xs text-white/60 mt-0.5 flex items-center gap-1.5">
                <i className="ti ti-map-pin-check" />
                {t('profil.agent')}
              </div>
            </div>
          </div>
          <div
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle,#1FB89E,transparent 70%)' }}
          />
        </div>

        {/* Activité */}
        <div className="bg-white rounded-2xl border border-gray-200/70 p-5 mb-4" style={{ boxShadow: OMBRE }}>
          <div className="text-sm font-semibold text-coli-encre mb-3">{t('profil.monActivite')}</div>
          <div className="grid grid-cols-3 gap-3">
            <Stat valeur={data?.recenses ?? 0} label={t('profil.recenses')} couleur="#1FB89E" />
            <Stat valeur={data?.valides ?? 0} label={t('profil.valides')} couleur="#17A2B8" />
            <Stat valeur={data?.attente ?? 0} label={t('profil.enAttente')} couleur="#F28C28" />
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-white rounded-2xl border border-gray-200/70 p-5 mb-4" style={{ boxShadow: OMBRE }}>
          <div className="text-sm font-semibold text-coli-encre mb-3">{t('profil.coordonnees')}</div>
          <Ligne icone="ti-mail" label={t('profil.email')} valeur={moi?.email ?? '-'} />
          <Ligne icone="ti-phone" label={t('profil.telephone')} valeur={moi?.telephone ?? '-'} />
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-2xl border border-gray-200/70 p-5 mb-4" style={{ boxShadow: OMBRE }}>
          <div className="text-sm font-semibold text-coli-encre mb-3">{t('profil.securite')}</div>
          <button
            onClick={() => setMdpOuvert(true)}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg transition"
          >
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <i className="ti ti-lock text-gray-400" />
              {t('profil.changerMdp')}
            </span>
            <i className="ti ti-chevron-right text-gray-400" />
          </button>
        </div>

        {/* Préférences */}
        <div className="bg-white rounded-2xl border border-gray-200/70 p-5 mb-4" style={{ boxShadow: OMBRE }}>
          <div className="text-sm font-semibold text-coli-encre mb-3">{t('profil.preferences')}</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <i className="ti ti-language text-gray-400" />
              {t('profil.langue')}
            </span>
            <SelecteurLangue />
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={() => setConfirmer(true)}
          className="w-full py-3.5 rounded-2xl bg-white border border-red-200 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition"
          style={{ boxShadow: OMBRE }}
        >
          <i className="ti ti-logout" />
          {t('profil.deconnexion')}
        </button>
      </div>

      <NavAgentBas />

      {/* Modal changement de mot de passe */}
      {mdpOuvert && <ModaleMotDePasse onFermer={() => setMdpOuvert(false)} />}

      {/* Confirmation de déconnexion */}
      {confirmer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <i className="ti ti-logout text-2xl" />
            </div>
            <p className="text-sm text-gray-700 mb-5">{t('profil.deconnexionConfirme')}</p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmer(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
              >
                {t('profil.annuler')}
              </button>
              <button
                onClick={deconnexion}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition"
              >
                {t('profil.confirmer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Modal changement de mot de passe ---
function ModaleMotDePasse({ onFermer }: { onFermer: () => void }) {
  const { t } = useTranslation();
  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirme, setConfirme] = useState('');

  const maj = useMutation({
    mutationFn: () => changerMotDePasse(ancien, nouveau),
    onSuccess: () => onFermer(),
  });

  const correspond = nouveau.length >= 6 && nouveau === confirme;
  const peutValider = ancien.length >= 1 && correspond;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onFermer}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 20px 60px rgba(14,26,36,.25)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="font-bold text-coli-encre">{t('profil.changerMdp')}</div>
          <button
            onClick={onFermer}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <ChampMdp label={t('profil.ancienMdp')} valeur={ancien} onChange={setAncien} />
          <ChampMdp label={t('profil.nouveauMdp')} valeur={nouveau} onChange={setNouveau} />
          <ChampMdp label={t('profil.confirmerMdp')} valeur={confirme} onChange={setConfirme} />
          {nouveau.length > 0 && nouveau.length < 6 && (
            <p className="text-[11px] text-coli-orange">{t('profil.mdpMin')}</p>
          )}
          {confirme.length > 0 && nouveau !== confirme && (
            <p className="text-[11px] text-red-500">{t('profil.mdpDifferent')}</p>
          )}
        </div>
        <div className="flex gap-2.5 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onFermer}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
          >
            {t('profil.annuler')}
          </button>
          <button
            onClick={() => maj.mutate()}
            disabled={!peutValider || maj.isPending}
            className="flex-1 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
          >
            {maj.isPending ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-check" />}
            {t('profil.valider')}
          </button>
        </div>
        {maj.isError && (
          <p className="text-xs text-red-600 px-5 pb-4 flex items-center gap-1">
            <i className="ti ti-alert-circle" />
            {t('profil.mdpErreur')}
          </p>
        )}
      </div>
    </div>
  );
}

function ChampMdp({
  label,
  valeur,
  onChange,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        type="password"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm"
      />
    </div>
  );
}

function Stat({ valeur, label, couleur }: { valeur: number; label: string; couleur: string }) {
  return (
    <div className="text-center">
      <div className="font-extrabold text-2xl" style={{ color: couleur, fontFamily: 'Sora, Inter' }}>
        {valeur}
      </div>
      <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

function Ligne({ icone, label, valeur }: { icone: string; label: string; valeur: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-none">
      <i className={`ti ${icone} text-gray-400`} />
      <span className="text-xs text-gray-400 flex-1">{label}</span>
      <span className="text-sm text-coli-encre font-medium truncate">{valeur}</span>
    </div>
  );
}