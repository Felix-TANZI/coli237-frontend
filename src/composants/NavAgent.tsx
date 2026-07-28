import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { seDeconnecter } from '../api/auth';
import { SelecteurLangue } from './SelecteurLangue';

const ONGLETS = [
  { to: '/agent', cle: 'navAccueil', icone: 'ti-home', exact: true },
  { to: '/agent/fiches', cle: 'navFiches', icone: 'ti-list', exact: false },
  { to: '/agent/recenser', cle: 'navRecenser', icone: 'ti-plus', exact: false },
  { to: '/agent/compagnies', cle: 'navCompagnies', icone: 'ti-building-store', exact: false },
  { to: '/agent/profil', cle: 'navProfil', icone: 'ti-user', exact: false },
];

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

// Barre du haut, visible seulement sur tablette/PC (md et plus).
export function NavAgentHaut({ nom }: { nom: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const deconnexion = () => {
    seDeconnecter();
    navigate('/connexion');
  };

  return (
    <header className="hidden md:flex bg-coli-encre px-6 py-3 items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold bg-gradient-to-br from-coli-orange to-coli-vert">
          C
        </div>
        <span className="text-white font-extrabold text-sm">COLI Agent</span>
      </div>

      <nav className="flex gap-0.5 bg-white/[.06] p-1 rounded-xl">
        {ONGLETS.map((o) => (
          <NavLink
            key={o.to}
            to={o.to}
            end={o.exact}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-coli-vert text-white'
                  : 'text-white/55 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <i className={`ti ${o.icone} text-base`} />
            {t(`agent.${o.cle}`)}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        <SelecteurLangue clair />
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-xs text-white"
          style={{ background: couleurAvatar(nom) }}
        >
          {initiales(nom)}
        </div>
        <button
          onClick={deconnexion}
          aria-label={t('agent.deconnexion')}
          className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
        >
          <i className="ti ti-logout text-base" />
        </button>
      </div>
    </header>
  );
}

// Barre du bas, visible seulement sur mobile (moins de md).
export function NavAgentBas() {
  const { t } = useTranslation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-2 z-40">
      {ONGLETS.map((o) => (
        <NavLink
          key={o.to}
          to={o.to}
          end={o.exact}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition ${
              isActive ? 'text-coli-vert' : 'text-gray-400'
            }`
          }
        >
          <i className={`ti ${o.icone} text-xl`} />
          {t(`agent.${o.cle}`)}
        </NavLink>
      ))}
    </nav>
  );
}