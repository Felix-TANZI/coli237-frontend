import { useTranslation } from "react-i18next";
import { CARTE_VIEWBOX, REGIONS_CAMEROUN } from "../carteCameroun";

function initiales(nom: string): string {
  const m = nom.trim().split(" ").filter(Boolean);
  if (m.length === 0) return "?";
  return m
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

// Associe une ville saisie a une region (correspondance simple par nom).
function regionDeVille(ville: string): string | null {
  if (!ville.trim()) return null;
  const v = ville.toLowerCase();
  const carte: Record<string, string> = {
    yaound: "Centre",
    douala: "Littoral",
    bafoussam: "Ouest",
    bamenda: "Nord-Ouest",
    buea: "Sud-Ouest",
    garoua: "Nord",
    maroua: "Extrême-Nord",
    ngaound: "Adamaoua",
    bertoua: "Est",
    ebolowa: "Sud",
    kribi: "Sud",
    limbe: "Sud-Ouest",
    edea: "Littoral",
  };
  for (const [cle, region] of Object.entries(carte)) {
    if (v.includes(cle)) return region;
  }
  return null;
}

export function PanneauContexte({
  nom,
  telephone,
  couleurAvatar,
  ville,
  quartier,
}: {
  nom: string;
  telephone: string;
  couleurAvatar: string;
  ville: string;
  quartier?: string;
  gps: { lat: number; lng: number } | null;
}) {
  const { t } = useTranslation();
  const regionActive = regionDeVille(ville);

  return (
    <div
      className="rounded-2xl p-5 text-white relative overflow-hidden h-full"
      style={{
        background: "linear-gradient(160deg,#0E1A24,#16334a)",
        boxShadow: "0 8px 24px rgba(14,26,36,.18)",
      }}
    >
      {/* Aperçu de la fiche */}
      <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3 relative z-10">
        {t("recensement.apercuFiche")}
      </div>
      <div className="relative z-10 flex items-center gap-3 bg-white/[.06] border border-white/10 rounded-xl p-3.5 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0"
          style={{ background: couleurAvatar }}
        >
          {initiales(nom || "?")}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">
            {nom || t("recensement.nomAVenir")}
          </div>
          <div className="text-[11px] text-white/55 truncate">
            {telephone ? `+237 ${telephone}` : t("recensement.telAVenir")}
          </div>
        </div>
      </div>

      {/* Carte réelle du Cameroun */}
      <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2 relative z-10">
        {t("recensement.localisation")}
      </div>
      <svg
        viewBox={CARTE_VIEWBOX}
        className="w-full h-auto max-h-52 relative z-10"
        aria-hidden="true"
      >
        {REGIONS_CAMEROUN.map((r) => {
          const active = regionActive === r.nom;
          return (
            <path
              key={r.nom}
              d={r.d}
              className="transition-all duration-500"
              fill={active ? "#1FB89E" : "rgba(255,255,255,.04)"}
              stroke={active ? "#1FB89E" : "rgba(255,255,255,.15)"}
              strokeWidth={active ? "1.2" : "0.8"}
            >
              <title>{r.nom}</title>
            </path>
          );
        })}
        {/* Point sur la région dès qu'elle est reconnue */}
        {regionActive &&
          REGIONS_CAMEROUN.filter((r) => r.nom === regionActive).map((r) => (
            <g key="pointeur">
              <circle
                className="cm-ping"
                cx={r.cx}
                cy={r.cy}
                style={{ stroke: "#F28C28" }}
              />
              <circle cx={r.cx} cy={r.cy} r="3.5" fill="#F28C28" />
            </g>
          ))}
      </svg>

      {regionActive && (
        <div className="mt-2 relative z-10 flex items-center gap-1.5 text-xs text-white/70">
          <i className="ti ti-map-pin text-coli-orange" />
          {quartier ? `${quartier}, ${ville}` : ville} · {regionActive}
        </div>
      )}

      <div
        className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle,#1FB89E,transparent 70%)",
        }}
      />
    </div>
  );
}
