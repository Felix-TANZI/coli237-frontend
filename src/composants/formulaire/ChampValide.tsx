// Champ texte avec indicateur visuel de validation (coche verte).
// `valide` : fonction qui dit si la valeur courante est correcte.
export function ChampValide({
  label,
  valeur,
  onChange,
  type = 'text',
  placeholder,
  requis = false,
  valide,
  optionnel = false,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  requis?: boolean;
  valide?: (v: string) => boolean;
  optionnel?: boolean;
}) {
  const aSaisi = valeur.trim() !== '';
  // Si pas de fonction valide fournie, on considere "rempli = ok".
  const estValide = valide ? valide(valeur) : aSaisi;
  const montrerCoche = aSaisi && estValide;
  const montrerErreur = aSaisi && !estValide && !optionnel;

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {requis && <span className="text-coli-orange ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-4 pr-10 py-3 rounded-xl border-2 outline-none transition text-sm ${
            montrerErreur
              ? 'border-red-300 focus:ring-4 focus:ring-red-100'
              : montrerCoche
                ? 'border-coli-vert focus:ring-4 focus:ring-coli-vert/10'
                : 'border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10'
          }`}
        />
        {montrerCoche && (
          <i className="ti ti-circle-check absolute right-3 top-1/2 -translate-y-1/2 text-coli-vert text-lg" />
        )}
      </div>
    </div>
  );
}