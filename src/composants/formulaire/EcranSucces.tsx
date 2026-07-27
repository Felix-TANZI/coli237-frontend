import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function EcranSucces({ onNouveau }: { onNouveau: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-coli-craie flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200/70 p-8 text-center max-w-sm w-full" style={{ boxShadow: '0 8px 24px rgba(14,26,36,.1)' }}>
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-coli-vert flex items-center justify-center mx-auto mb-4">
          <i className="ti ti-circle-check text-3xl" />
        </div>
        <h1 className="font-extrabold text-lg text-coli-encre" style={{ fontFamily: 'Sora, Inter' }}>
          {t('recensement.succesTitre')}
        </h1>
        <p className="text-sm text-gray-500 mt-1.5 mb-6">
          {t('recensement.succesTexte')}
        </p>
        <div className="space-y-2.5">
          <button
            onClick={onNouveau}
            className="w-full py-3 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition"
          >
            <i className="ti ti-plus" />
            {t('recensement.nouveau')}
          </button>
          <button
            onClick={() => navigate('/agent')}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
          >
            {t('recensement.retourAccueil')}
          </button>
        </div>
      </div>
    </div>
  );
}