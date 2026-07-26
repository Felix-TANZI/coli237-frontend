import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { seDeconnecter } from '../api/auth';
import { SelecteurLangue } from './SelecteurLangue';

const ONGLETS = [
  { to: '/tableau-de-bord', cle: 'apercu', icone: 'ti-layout-dashboard' },
  { to: '/coursiers', cle: 'coursiers', icone: 'ti-motorbike' },
  { to: '/partenaires', cle: 'partenaires', icone: 'ti-building-store' },
  { to: '/agents', cle: 'agents', icone: 'ti-users' },
];

export function BarreNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const deconnexion = () => {
    seDeconnecter();
    navigate('/connexion');
  };

  return (
    <header className="bg-coli-encre px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold bg-gradient-to-br from-coli-orange to-coli-vert">
          C
        </div>
        <span className="text-white font-extrabold text-sm hidden sm:block">
          COLI Admin
        </span>
      </div>

      {/* Onglets — desktop */}
      <nav className="hidden md:flex gap-0.5 bg-white/[.06] p-1 rounded-xl">
        {ONGLETS.map((o) => (
          <NavLink
            key={o.to}
            to={o.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-coli-vert text-white'
                  : 'text-white/55 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <i className={`ti ${o.icone} text-base`} />
            {t(`nav.${o.cle}`)}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        <SelecteurLangue clair />
        <button
          onClick={deconnexion}
          aria-label={t('nav.deconnexion')}
          className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
        >
          <i className="ti ti-logout text-base" />
        </button>
      </div>
    </header>
  );
}

// Barre de navigation mobile (en bas de l'ecran, comme une app).
export function BarreNavMobile() {
  const { t } = useTranslation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-around py-2 z-40">
      {ONGLETS.map((o) => (
        <NavLink
          key={o.to}
          to={o.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition ${
              isActive ? 'text-coli-vert' : 'text-gray-400'
            }`
          }
        >
          <i className={`ti ${o.icone} text-xl`} />
          {t(`nav.${o.cle}`)}
        </NavLink>
      ))}
    </nav>
  );
}