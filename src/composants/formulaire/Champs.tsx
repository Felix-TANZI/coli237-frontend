import type { ReactNode } from 'react';

// Champ texte avec validation visuelle (coche verte / message d'erreur).
export function ChampTexte({
  label,
  valeur,
  onChange,
  placeholder,
  icone,
  type = 'text',
  requis = false,
  aide,
  valide,
  messageErreur,
  maxLength,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icone?: string;
  type?: string;
  requis?: boolean;
  aide?: string;
  valide?: boolean;
  messageErreur?: string;
  maxLength?: number;
}) {
  const aSaisi = valeur.trim() !== '';
  const montrerCoche = aSaisi && valide === true;
  const montrerErreur = aSaisi && valide === false;

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {requis && <span className="text-coli-orange ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icone && (
          <i className={`ti ${icone} absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg`} />
        )}
        <input
          type={type}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={requis}
          maxLength={maxLength}
          className={`w-full ${icone ? 'pl-11' : 'pl-4'} ${montrerCoche || montrerErreur ? 'pr-10' : 'pr-4'} py-3 rounded-xl border-2 outline-none transition text-sm bg-white ${
            montrerErreur
              ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
              : montrerCoche
                ? 'border-coli-vert focus:ring-4 focus:ring-emerald-100'
                : 'border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10'
          }`}
        />
        {montrerCoche && (
          <i className="ti ti-circle-check absolute right-3.5 top-1/2 -translate-y-1/2 text-coli-vert text-lg" />
        )}
        {montrerErreur && (
          <i className="ti ti-alert-circle absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 text-lg" />
        )}
      </div>
      {montrerErreur && messageErreur ? (
        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
          <i className="ti ti-info-circle text-xs" />
          {messageErreur}
        </p>
      ) : (
        aide && <p className="text-[11px] text-gray-400 mt-1">{aide}</p>
      )}
    </div>
  );
}

// Sélection visuelle (grille d'options avec icônes).
export function ChampChoix({
  label,
  valeur,
  onChange,
  options,
  colonnes = 3,
  requis = false,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  options: { valeur: string; libelle: string; icone?: string }[];
  colonnes?: number;
  requis?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {requis && <span className="text-coli-orange ml-0.5">*</span>}
      </label>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))` }}
      >
        {options.map((o) => {
          const actif = valeur === o.valeur;
          return (
            <button
              key={o.valeur}
              type="button"
              onClick={() => onChange(o.valeur)}
              className={`border-2 rounded-xl py-3 px-2 text-center transition ${
                actif
                  ? 'border-coli-vert bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {o.icone && (
                <i className={`ti ${o.icone} text-xl ${actif ? 'text-coli-vert' : 'text-gray-500'}`} />
              )}
              <div className={`text-[11px] mt-1 ${actif ? 'text-coli-vert font-medium' : 'text-gray-600'}`}>
                {o.libelle}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Interrupteur oui/non.
export function ChampBascule({
  label,
  valeur,
  onChange,
}: {
  label: string;
  valeur: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!valeur)}
      className="w-full flex items-center justify-between py-3 px-4 rounded-xl border-2 border-gray-200 bg-white mb-3 transition hover:border-gray-300"
    >
      <span className="text-sm text-gray-700">{label}</span>
      <span
        className={`w-11 h-6 rounded-full flex items-center transition ${valeur ? 'bg-coli-vert justify-end' : 'bg-gray-300 justify-start'} px-0.5`}
      >
        <span className="w-5 h-5 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}

// Conteneur d'une étape (titre + contenu).
export function BlocEtape({
  numero,
  icone,
  titre,
  sousTitre,
  children,
}: {
  numero?: number;
  icone: string;
  titre: string;
  sousTitre: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-coli-vert flex items-center justify-center">
          <i className={`ti ${icone} text-lg`} />
        </div>
        <div>
          <div className="text-[15px] font-semibold text-coli-encre">{titre}</div>
          <div className="text-[11px] text-gray-400">{sousTitre}</div>
        </div>
        {numero && (
          <span className="ml-auto text-xs text-gray-300 font-mono">{numero}</span>
        )}
      </div>
      {children}
    </div>
  );
}