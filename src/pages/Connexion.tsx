import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { seConnecter, sinscrire } from '../api/auth';
import { SceneConnexion } from '../composants/SceneConnexion';
import { SelecteurLangue } from '../composants/SelecteurLangue';

const CHAMP_STYLE = {
  background: 'rgba(255,255,255,.07)',
  borderColor: 'rgba(255,255,255,.18)',
};

export function Connexion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');

  // Champs connexion
  const [identifiant, setIdentifiant] = useState(
    () => localStorage.getItem('coli_dernier_id') ?? '',
  );
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [seSouvenir, setSeSouvenir] = useState(true);
  const [aideOubli, setAideOubli] = useState(false);

  // Champs inscription
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  const allerVers = (role: string) => {
    if (role === 'ADMIN') navigate('/tableau-de-bord');
    else navigate('/agent');
  };

  const connexion = useMutation({
    mutationFn: () => seConnecter(identifiant, motDePasse, seSouvenir),
    onSuccess: (data) => {
      // Retient l'identifiant pour le prochain login si demande.
      if (seSouvenir) localStorage.setItem('coli_dernier_id', identifiant);
      else localStorage.removeItem('coli_dernier_id');
      allerVers(data.agent.role);
    },
  });

  const inscription = useMutation({
    mutationFn: () => sinscrire(nom, email, telephone, motDePasse, seSouvenir),
    onSuccess: (data) => allerVers(data.agent.role),
  });

  const inscriptionOk =
    nom.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    telephone.replace(/\D/g, '').length >= 8 &&
    motDePasse.length >= 6;

  return (
    <div
      className="relative min-h-screen flex items-center px-6 md:px-14 overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 25% 15%, #14304a 0%, #0E1A24 50%, #070d15 100%)',
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
          {mode === 'connexion' ? t('connexion.titre') : 'Creer un compte'}
        </h1>
        <p className="text-white/60 text-sm mt-1.5 mb-6">
          {mode === 'connexion'
            ? t('connexion.sousTitre')
            : 'Inscrivez-vous pour commencer a recenser'}
        </p>

        {/* ===== MODE CONNEXION ===== */}
        {mode === 'connexion' && (
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
                  style={CHAMP_STYLE}
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
                  autoComplete="off"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl outline-none text-white placeholder-white/40 border transition"
                  style={CHAMP_STYLE}
                />
                <button
                  type="button"
                  onClick={() => setAfficherMdp((v) => !v)}
                  aria-label={afficherMdp ? t('connexion.masquer') : t('connexion.afficher')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-coli-vert transition"
                >
                  <i className={`ti ${afficherMdp ? 'ti-eye-off' : 'ti-eye'} text-lg`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seSouvenir}
                  onChange={(e) => setSeSouvenir(e.target.checked)}
                  className="accent-coli-vert"
                />
                {t('connexion.seSouvenir')}
              </label>
              <button
                type="button"
                onClick={() => setAideOubli((v) => !v)}
                className="text-coli-vert hover:underline"
              >
                {t('connexion.oublie')}
              </button>
            </div>

            {aideOubli && (
              <p className="text-[11px] text-white/60 bg-white/5 rounded-lg p-2.5">
                {t('connexion.aideOubli')}
              </p>
            )}

            {connexion.isError && (
              <p className="text-xs text-red-300 flex items-center gap-1.5">
                <i className="ti ti-alert-circle" />
                {t('connexion.erreur')}
              </p>
            )}

            <button
              type="submit"
              disabled={connexion.isPending}
              className="w-full py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-600 transition"
            >
              {connexion.isPending ? (
                <>
                  <i className="ti ti-loader-2 animate-spin" />
                  {t('connexion.chargement')}
                </>
              ) : (
                t('connexion.bouton')
              )}
            </button>
          </form>
        )}

        {/* ===== MODE INSCRIPTION ===== */}
        {mode === 'inscription' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              inscription.mutate();
            }}
            className="space-y-3.5"
          >
            <ChampInscription
              icone="ti-user"
              type="text"
              valeur={nom}
              onChange={setNom}
              label="Nom complet"
              placeholder="Kevin Roldan"
            />
            <ChampInscription
              icone="ti-mail"
              type="email"
              valeur={email}
              onChange={setEmail}
              label="Email"
              placeholder="exemple@mail.com"
            />

            {/* Telephone avec selecteur de pays (version sombre, locale) */}
            <ChampTelephoneSombre valeur={telephone} onChange={setTelephone} />

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
                  placeholder="Au moins 6 caracteres"
                  required
                  autoComplete="new-password"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl outline-none text-white placeholder-white/40 border transition"
                  style={CHAMP_STYLE}
                />
                <button
                  type="button"
                  onClick={() => setAfficherMdp((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-coli-vert transition"
                >
                  <i className={`ti ${afficherMdp ? 'ti-eye-off' : 'ti-eye'} text-lg`} />
                </button>
              </div>
            </div>

            {inscription.isError && (
              <p className="text-xs text-red-300 flex items-center gap-1.5">
                <i className="ti ti-alert-circle" />
                Cet email ou telephone est deja utilise.
              </p>
            )}

            <button
              type="submit"
              disabled={!inscriptionOk || inscription.isPending}
              className="w-full py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
            >
              {inscription.isPending ? (
                <>
                  <i className="ti ti-loader-2 animate-spin" />
                  Creation...
                </>
              ) : (
                'Creer mon compte'
              )}
            </button>
          </form>
        )}

        {/* Bascule connexion / inscription */}
        <div className="text-center mt-5 text-xs text-white/60">
          {mode === 'connexion' ? (
            <>
              Pas encore de compte ?{' '}
              <button
                onClick={() => setMode('inscription')}
                className="text-coli-vert font-semibold hover:underline"
              >
                Creer un compte
              </button>
            </>
          ) : (
            <>
              Deja un compte ?{' '}
              <button
                onClick={() => setMode('connexion')}
                className="text-coli-vert font-semibold hover:underline"
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Champ stylé pour l'inscription (fond sombre).
function ChampInscription({
  icone,
  type,
  valeur,
  onChange,
  label,
  placeholder,
}: {
  icone: string;
  type: string;
  valeur: string;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/75 mb-1.5">{label}</label>
      <div className="relative">
        <i className={`ti ${icone} absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 text-lg`} />
        <input
          type={type}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          autoComplete="off"
          className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none text-white placeholder-white/40 border transition"
          style={{ background: 'rgba(255,255,255,.07)', borderColor: 'rgba(255,255,255,.18)' }}
        />
      </div>
    </div>
  );
}

// Pays proposes : Cameroun + voisins. maxChiffres = longueur du numero national.
const PAYS_TEL = [
  { code: 'CM', nom: 'Cameroun', indicatif: '+237', drapeau: '🇨🇲', maxChiffres: 9 },
  { code: 'TD', nom: 'Tchad', indicatif: '+235', drapeau: '🇹🇩', maxChiffres: 8 },
  { code: 'CF', nom: 'RCA', indicatif: '+236', drapeau: '🇨🇫', maxChiffres: 8 },
  { code: 'GA', nom: 'Gabon', indicatif: '+241', drapeau: '🇬🇦', maxChiffres: 8 },
  { code: 'GQ', nom: 'Guinee Eq.', indicatif: '+240', drapeau: '🇬🇶', maxChiffres: 9 },
  { code: 'CG', nom: 'Congo', indicatif: '+242', drapeau: '🇨🇬', maxChiffres: 9 },
  { code: 'NG', nom: 'Nigeria', indicatif: '+234', drapeau: '🇳🇬', maxChiffres: 10 },
];

// Champ telephone avec selecteur de pays custom, style sombre (local a la connexion).
function ChampTelephoneSombre({
  valeur,
  onChange,
}: {
  valeur: string;
  onChange: (v: string) => void;
}) {
  const [codePays, setCodePays] = useState('CM');
  const [ouvert, setOuvert] = useState(false);
  const refMenu = useRef<HTMLDivElement>(null);
  const pays = PAYS_TEL.find((p) => p.code === codePays) ?? PAYS_TEL[0];

  // Ferme le menu au clic exterieur.
  useEffect(() => {
    if (!ouvert) return;
    const surClic = (e: MouseEvent) => {
      if (refMenu.current && !refMenu.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', surClic);
    return () => document.removeEventListener('mousedown', surClic);
  }, [ouvert]);

  const numeroNational = valeur.replace(pays.indicatif, '').replace(/\D/g, '');
  const valide = numeroNational.length === pays.maxChiffres;
  const montrerCoche = numeroNational.length > 0 && valide;

  const afficher = (n: string) => {
    if (n.length === 0) return '';
    const reste = n.slice(1).replace(/(\d{2})(?=\d)/g, '$1 ');
    return `${n[0]} ${reste}`.trim();
  };

  const surSaisie = (saisi: string) => {
    const chiffres = saisi.replace(/\D/g, '').slice(0, pays.maxChiffres);
    onChange(chiffres ? `${pays.indicatif}${chiffres}` : '');
  };

  const choisirPays = (code: string) => {
    setCodePays(code);
    setOuvert(false);
    const nouveau = PAYS_TEL.find((p) => p.code === code) ?? PAYS_TEL[0];
    const chiffres = numeroNational.slice(0, nouveau.maxChiffres);
    onChange(chiffres ? `${nouveau.indicatif}${chiffres}` : '');
  };

  const styleChamp = {
    background: 'rgba(255,255,255,.07)',
    borderColor: 'rgba(255,255,255,.18)',
  };

  return (
    <div>
      <label className="block text-xs font-medium text-white/75 mb-1.5">
        Telephone <span className="text-coli-orange">*</span>
      </label>
      <div className="flex gap-2">
        {/* Selecteur de pays custom */}
        <div className="relative shrink-0" ref={refMenu}>
          <button
            type="button"
            onClick={() => setOuvert((v) => !v)}
            className="h-full flex items-center gap-1.5 px-3 rounded-xl border outline-none text-white text-sm"
            style={styleChamp}
          >
            <span className="text-base leading-none">{pays.drapeau}</span>
            <span>{pays.indicatif}</span>
            <i
              className={`ti ti-chevron-down text-white/50 text-xs transition-transform ${ouvert ? 'rotate-180' : ''}`}
            />
          </button>

          {ouvert && (
            <div
              className="absolute left-0 top-full mt-1.5 z-20 w-44 rounded-xl overflow-hidden border"
              style={{
                background: '#132433',
                borderColor: 'rgba(255,255,255,.14)',
                boxShadow: '0 12px 34px rgba(0,0,0,.5)',
              }}
            >
              {PAYS_TEL.map((p) => {
                const actif = p.code === codePays;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => choisirPays(p.code)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition text-left"
                    style={{
                      background: actif ? 'rgba(31,184,158,.16)' : 'transparent',
                      color: actif ? '#5DCAA5' : 'rgba(255,255,255,.85)',
                    }}
                    onMouseEnter={(e) => {
                      if (!actif) e.currentTarget.style.background = 'rgba(255,255,255,.06)';
                    }}
                    onMouseLeave={(e) => {
                      if (!actif) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span className="text-base leading-none">{p.drapeau}</span>
                    <span className="flex-1">{p.nom}</span>
                    <span className="text-white/50 text-xs">{p.indicatif}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Champ numero */}
        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="numeric"
            value={afficher(numeroNational)}
            onChange={(e) => surSaisie(e.target.value)}
            placeholder="6 90 12 34 56"
            required
            autoComplete="off"
            className="w-full pl-4 pr-10 py-2.5 rounded-xl outline-none text-white placeholder-white/40 border transition text-sm"
            style={styleChamp}
          />
          {montrerCoche && (
            <i className="ti ti-circle-check absolute right-3 top-1/2 -translate-y-1/2 text-coli-vert text-lg" />
          )}
        </div>
      </div>
    </div>
  );
}