import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { creerCompagnie, type Compagnie } from '../api/compagnies';

// Selecteur de compagnie avec possibilite d'en creer une a la volee.
export function SelecteurCompagnie({
  compagnies,
  valeur,
  onChange,
}: {
  compagnies: Compagnie[];
  valeur: string;
  onChange: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [modalOuvert, setModalOuvert] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={valeur}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="">{t('compagnies.selectionner')}</option>
            {compagnies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => setModalOuvert(true)}
          className="px-3.5 rounded-xl bg-coli-vert/10 text-coli-vert flex items-center justify-center hover:bg-coli-vert/20 transition shrink-0"
          aria-label={t('compagnies.creerAria')}
        >
          <i className="ti ti-plus text-lg" />
        </button>
      </div>

      {modalOuvert && (
        <ModaleCreerCompagnie
          onFermer={() => setModalOuvert(false)}
          onCree={(compagnie) => {
            onChange(compagnie.id);
            setModalOuvert(false);
          }}
        />
      )}
    </>
  );
}

// Petit modal de creation rapide d'une compagnie.
function ModaleCreerCompagnie({
  onFermer,
  onCree,
}: {
  onFermer: () => void;
  onCree: (compagnie: Compagnie) => void;
}) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [nom, setNom] = useState('');

  const creation = useMutation({
    mutationFn: () => creerCompagnie({ nom: nom.trim(), statut: 'ACTIVE' }),
    onSuccess: (compagnie) => {
      void qc.invalidateQueries({ queryKey: ['compagnies'] });
      onCree(compagnie);
    },
  });

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
      onClick={onFermer}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 20px 60px rgba(14,26,36,.25)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="font-bold text-coli-encre">{t('compagnies.nouvelle')}</div>
          <button
            onClick={onFermer}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="p-5">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {t('compagnies.nomLabel')} <span className="text-coli-orange">*</span>
          </label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder={t('compagnies.nomPlaceholder')}
            autoFocus
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 outline-none text-sm"
          />
          {creation.isError && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <i className="ti ti-alert-circle" />
              {t('commun.erreurCreation')}
            </p>
          )}
        </div>
        <div className="flex gap-2.5 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onFermer}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
          >
            {t('commun.annuler')}
          </button>
          <button
            onClick={() => creation.mutate()}
            disabled={creation.isPending || nom.trim().length < 2}
            className="flex-1 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
          >
            {creation.isPending ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-check" />}
            {t('commun.creer')}
          </button>
        </div>
      </div>
    </div>
  );
}