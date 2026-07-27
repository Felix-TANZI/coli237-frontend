import { useState } from "react";

// Champ texte avec liste de suggestions, tout en autorisant la saisie libre.
export function ChampSuggestions({
  label,
  valeur,
  onChange,
  suggestions,
  icone,
  placeholder,
  requis = false,
  aide,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  suggestions: string[];
  icone?: string;
  placeholder?: string;
  requis?: boolean;
  aide?: string;
}) {
  const [ouvert, setOuvert] = useState(false);

  // Filtre les suggestions selon ce qui est tapé.
  const filtrees = suggestions
    .filter((s) => s.toLowerCase().includes(valeur.toLowerCase()))
    .filter((s) => s.toLowerCase() !== valeur.toLowerCase())
    .slice(0, 6);

  return (
    <div className="mb-4 relative">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {requis && <span className="text-coli-orange ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icone && (
          <i
            className={`ti ${icone} absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg`}
          />
        )}
        <input
          value={valeur}
          onChange={(e) => {
            onChange(e.target.value);
            setOuvert(true);
          }}
          onFocus={() => setOuvert(true)}
          onBlur={() => setTimeout(() => setOuvert(false), 150)}
          placeholder={placeholder}
          required={requis}
          className={`w-full ${icone ? "pl-11" : "pl-4"} pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 outline-none transition text-sm bg-white`}
        />
      </div>

      {/* Liste déroulante de suggestions */}
      {ouvert && filtrees.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden ag-anim">
          {filtrees.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => {
                onChange(s);
                setOuvert(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-coli-vert transition flex items-center gap-2"
            >
              <i className="ti ti-corner-down-right text-gray-300 text-sm" />
              {s}
            </button>
          ))}
        </div>
      )}

      {aide && <p className="text-[11px] text-gray-400 mt-1">{aide}</p>}
    </div>
  );
}
