import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { seConnecter } from '../api/auth';
import { SceneConnexion } from '../composants/SceneConnexion';
import { SelecteurLangue } from '../composants/SelecteurLangue';

export function Connexion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [seSouvenir, setSeSouvenir] = useState(true);
  const [aideOubli, setAideOubli] = useState(false);

  const connexion = useMutation({
    mutationFn: () => seConnecter(identifiant, motDePasse, seSouvenir),
    onSuccess: () => navigate('/tableau-de-bord'),
  });

  return (
    <div
      className="relative min-h-screen flex items-center px-6 md:px-14 overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 25% 15%, #14304a 0%, #0E1A24 50%, #070d15 100%)',
      }}
    >
      <SceneConnexion />

      {/* Formulaire en verre */}
      <div
        className="coli-glass relative z-10 w-full max-w-sm rounded-3xl p-8 border"
        style={{
          background: 'rgba(255,255,255,.07)',
          borderColor: 'rgba(255,255,255,.15)',
          backdropFilter: 'blur(22px)',
          boxShadow: '0 20px 60px rgba(0,0,0,.45)',
        }}
      >
        <div className="absolute top-5 right-5">
          <SelecteurLangue clair />
        </div>

        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-lg mb-5 bg-gradient-to-br from-coli-orange to-coli-vert">
          C
        </div>

        <h1 className="text-white font-extrabold text-2xl tracking-tight">
          {t('connexion.titre')}
        </h1>
        <p className="text-white/60 text-sm mt-1.5 mb-6">
          {t('connexion.sousTitre')}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            connexion.mutate();
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-xs font-medium text-white/75 mb-1.5">
              {t('connexion.identifiant')}
            </label>
            <div className="relative">
              <i className="ti ti-user absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
              <input
                type="text"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder={t('connexion.identifiantExemple')}
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none text-white placeholder-white/40 border transition"
                style={{
                  background: 'rgba(255,255,255,.07)',
                  borderColor: 'rgba(255,255,255,.18)',
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/75 mb-1.5">
              {t('connexion.motDePasse')}
            </label>
            <div className="relative">
              <i className="ti ti-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 text-lg" />
              <input
                type={afficherMdp ? 'text' : 'password'}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-11 py-2.5 rounded-xl outline-none text-white placeholder-white/40 border transition"
                style={{
                  background: 'rgba(255,255,255,.07)',
                  borderColor: 'rgba(255,255,255,.18)',
                }}
              />
              <button
                type="button"
                onClick={() => setAfficherMdp((v) => !v)}
                aria-label={
                  afficherMdp ? t('connexion.masquer') : t('connexion.afficher')
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-coli-vert transition"
              >
                <i className={`ti ${afficherMdp ? 'ti-eye-off' : 'ti-eye'} text-lg`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-white/70">
              <input
                type="checkbox"
                checked={seSouvenir}
                onChange={(e) => setSeSouvenir(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-coli-orange"
              />
              {t('connexion.seSouvenir')}
            </label>
            <button
              type="button"
              onClick={() => setAideOubli(true)}
              className="font-semibold hover:underline"
              style={{ color: '#5DCAA5' }}
            >
              {t('connexion.oublie')}
            </button>
          </div>

          {aideOubli && (
            <p className="text-xs text-white/70 rounded-lg p-3 flex gap-2 bg-white/5">
              <i className="ti ti-info-circle text-base shrink-0" style={{ color: '#5DCAA5' }} />
              {t('connexion.aideOubli')}
            </p>
          )}

          {connexion.isError && (
            <p className="text-sm flex items-center gap-1.5" style={{ color: '#F0997B' }}>
              <i className="ti ti-alert-circle text-base" />
              {t('connexion.erreur')}
            </p>
          )}

          <button
            type="submit"
            disabled={connexion.isPending}
            className="w-full py-3 rounded-xl bg-coli-orange text-white font-semibold hover:bg-coli-orange-fonce hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-1"
            style={{ boxShadow: '0 6px 20px rgba(242,140,40,.4)' }}
          >
            {connexion.isPending ? t('connexion.chargement') : t('connexion.bouton')}
            {!connexion.isPending && <i className="ti ti-arrow-right" />}
          </button>
        </form>
      </div>
    </div>
  );
}