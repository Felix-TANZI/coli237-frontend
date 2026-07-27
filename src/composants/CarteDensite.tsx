import { useState } from "react";
import { useTranslation } from "react-i18next";
import { REGIONS_CAMEROUN } from "./carteCameroun";

function niveau(valeur: number, max: number): string {
  if (max === 0) return "#e3edf0";
  const ratio = valeur / max;
  if (ratio > 0.6) return "#1FB89E";
  if (ratio > 0.25) return "#9FE1CB";
  if (ratio > 0) return "#CDEEE2";
  return "#e3edf0";
}

export function CarteDensite({
  parRegion,
}: {
  parRegion: Record<string, number>;
}) {
  const { t } = useTranslation();
  const [survol, setSurvol] = useState<string | null>(null);
  const [verrouille, setVerrouille] = useState<string | null>(null);

  const valeurs = Object.values(parRegion);
  const max = valeurs.length ? Math.max(...valeurs) : 0;

  const densiteRegion = (nomRegion: string): number => {
    for (const [ville, n] of Object.entries(parRegion)) {
      if (ville.toLowerCase().includes(nomRegion.toLowerCase().slice(0, 4)))
        return n;
    }
    return 0;
  };

  // La region mise en avant : celle verrouillee, sinon celle survolee.
  const active = verrouille ?? survol;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-sm text-coli-encre">
          {t("tableau.densite")}
        </div>
        <span className="text-[11px] text-gray-400">
          {active
            ? `${active} · ${densiteRegion(active)} ${t("tableau.recensements")}`
            : t("tableau.survolez")}
        </span>
      </div>

      <svg viewBox="0 0 300 440" className="w-full h-auto min-h-[300px]">
        {REGIONS_CAMEROUN.map((r) => {
          const estActive = active === r.nom;
          const estVerrouille = verrouille === r.nom;
          let couleur = niveau(densiteRegion(r.nom), max);
          if (estVerrouille) couleur = "#F28C28";
          else if (survol === r.nom) couleur = "#1FB89E";

          return (
            <path
              key={r.nom}
              d={r.d}
              fill={couleur}
              stroke={estActive ? "#0E1A24" : "#cdd8dd"}
              strokeWidth={estActive ? "1.4" : "0.7"}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setSurvol(r.nom)}
              onMouseLeave={() => setSurvol(null)}
              onClick={() => setVerrouille((v) => (v === r.nom ? null : r.nom))}
            >
              <title>{r.nom}</title>
            </path>
          );
        })}
      </svg>

      <div className="flex gap-3 mt-2 text-[10.5px] text-gray-500">
        <span className="flex items-center gap-1">
          <span
            className="w-2.5 h-2.5 rounded"
            style={{ background: "#1FB89E" }}
          />
          {t("tableau.elevee")}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-2.5 h-2.5 rounded"
            style={{ background: "#9FE1CB" }}
          />
          {t("tableau.moyenne")}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-2.5 h-2.5 rounded"
            style={{ background: "#e3edf0" }}
          />
          {t("tableau.faible")}
        </span>
      </div>
    </div>
  );
}
