import { detecterOperateur, nettoyerNumero } from "./validation";

// Champ telephone avec drapeau Cameroun + indicatif +237.
// Detecte l'operateur (MTN/Orange) et l'affiche si demande.
export function ChampTelephone({
  label,
  valeur,
  onChange,
  requis = false,
  aide,
  valide,
  messageErreur,
  montrerOperateur = false,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  requis?: boolean;
  aide?: string;
  valide?: boolean;
  messageErreur?: string;
  montrerOperateur?: boolean;
}) {
  const aSaisi = valeur.trim() !== "";
  const montrerCoche = aSaisi && valide === true;
  const montrerErreur = aSaisi && valide === false;
  const operateur = montrerOperateur ? detecterOperateur(valeur) : null;

  // Formatage leger : espace tous les 2 chiffres pour la lisibilite.
  const afficher = (v: string) => {
    const n = nettoyerNumero(v).replace(/^\+237/, "");
    if (n.length === 0) return "";
    // Premier chiffre isolé, puis groupes de 2 : 6 90 12 34 56
    const reste = n.slice(1).replace(/(\d{2})(?=\d)/g, "$1 ");
    return `${n[0]} ${reste}`.trim();
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {requis && <span className="text-coli-orange ml-0.5">*</span>}
      </label>
      <div className="flex gap-2">
        {/* Bloc drapeau + indicatif */}
        <div className="flex items-center gap-1.5 px-3 rounded-xl border-2 border-gray-200 bg-white text-sm shrink-0">
          <span className="text-lg leading-none">🇨🇲</span>
          <span className="text-gray-600 font-medium">+237</span>
        </div>
        {/* Champ numero */}
        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="numeric"
            value={afficher(valeur)}
            onChange={(e) => onChange(e.target.value)}
            placeholder="6 90 12 34 56"
            required={requis}
            className={`w-full pl-4 pr-10 py-3 rounded-xl border-2 outline-none transition text-sm bg-white ${
              montrerErreur
                ? "border-red-300 focus:ring-4 focus:ring-red-100"
                : montrerCoche
                  ? "border-coli-vert focus:ring-4 focus:ring-emerald-100"
                  : "border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10"
            }`}
          />
          {montrerCoche && (
            <i className="ti ti-circle-check absolute right-3.5 top-1/2 -translate-y-1/2 text-coli-vert text-lg" />
          )}
          {montrerErreur && (
            <i className="ti ti-alert-circle absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 text-lg" />
          )}
        </div>
      </div>

      {/* Opérateur détecté */}
      {operateur && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{
              background: operateur === "MTN" ? "#FFCC00" : "#FF6600",
              color: operateur === "MTN" ? "#0E1A24" : "#fff",
            }}
          >
            {operateur}
          </span>
          <span className="text-[11px] text-gray-400">
            détecté automatiquement
          </span>
        </div>
      )}

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
