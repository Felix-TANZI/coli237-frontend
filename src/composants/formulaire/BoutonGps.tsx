import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Récupère la position GPS de l'appareil.
export function BoutonGps({
  position,
  onPosition,
}: {
  position: { lat: number; lng: number } | null;
  onPosition: (p: { lat: number; lng: number } | null) => void;
}) {
  const { t } = useTranslation();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState(false);

  const localiser = () => {
    setEnCours(true);
    setErreur(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setEnCours(false);
      },
      () => {
        setErreur(true);
        setEnCours(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={localiser}
        disabled={enCours}
        className={`w-full flex items-center gap-3 py-3.5 px-4 rounded-xl border-2 transition ${
          position
            ? 'border-coli-vert bg-emerald-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${position ? 'bg-coli-vert text-white' : 'bg-gray-100 text-gray-500'}`}>
          <i className={`ti ${enCours ? 'ti-loader-2 animate-spin' : position ? 'ti-map-pin-check' : 'ti-map-pin'} text-lg`} />
        </div>
        <div className="text-left flex-1">
          <div className="text-sm font-medium text-coli-encre">
            {position ? t('recensement.gpsPris') : t('recensement.gpsPrendre')}
          </div>
          <div className="text-[11px] text-gray-400">
            {position
              ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
              : t('recensement.gpsAide')}
          </div>
        </div>
        {position && (
          <i
            className="ti ti-x text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onPosition(null);
            }}
          />
        )}
      </button>
      {erreur && (
        <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
          <i className="ti ti-alert-circle" />
          {t('recensement.gpsErreur')}
        </p>
      )}
    </div>
  );
}