import { useTranslation } from "react-i18next";
import { CARTE_VIEWBOX, REGIONS_CAMEROUN, YAOUNDE } from "./carteCameroun";

// Points de recensement animes, places sur quelques regions.
const POINTS = [
  { cx: 130.9, cy: 317.6, couleur: "#F28C28", delai: 2.8, ping: true },
  { cx: 69.5, cy: 332.2, couleur: "#1FB89E", delai: 3.3, ping: true },
  { cx: 88.4, cy: 287.1, couleur: "#1FB89E", delai: 3.7, ping: false },
  { cx: 206.2, cy: 180.4, couleur: "#F28C28", delai: 4.1, ping: true },
  { cx: 39.3, cy: 298.2, couleur: "#1FB89E", delai: 4.5, ping: false },
  { cx: 228.0, cy: 86.2, couleur: "#1FB89E", delai: 4.9, ping: false },
];

export function SceneConnexion() {
  const { t } = useTranslation();

  return (
    <>
      {/* Grille de fond */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 900 580"
        aria-hidden="true"
      >
        <g stroke="#fff" strokeOpacity="0.025">
          <line x1="0" y1="145" x2="900" y2="145" />
          <line x1="0" y1="290" x2="900" y2="290" />
          <line x1="0" y1="435" x2="900" y2="435" />
          <line x1="180" y1="0" x2="180" y2="580" />
          <line x1="360" y1="0" x2="360" y2="580" />
          <line x1="540" y1="0" x2="540" y2="580" />
          <line x1="720" y1="0" x2="720" y2="580" />
        </g>
      </svg>

      {/* Carte du Cameroun */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 h-[86%] z-[2] hidden sm:block">
        <svg
          viewBox={CARTE_VIEWBOX}
          className="h-full w-auto"
          aria-hidden="true"
        >
          {REGIONS_CAMEROUN.map((r, i) => (
            <path
              key={r.nom}
              className="cm-reg"
              style={{ animationDelay: `${i * 0.22}s` }}
              d={r.d}
            />
          ))}
          {POINTS.map((p, i) => (
            <g key={i}>
              {p.ping && (
                <circle
                  className="cm-ping"
                  cx={p.cx}
                  cy={p.cy}
                  style={{ animationDelay: `${p.delai}s` }}
                />
              )}
              <circle
                className="cm-dot"
                cx={p.cx}
                cy={p.cy}
                r="3.5"
                fill={p.couleur}
                style={{ animationDelay: `${p.delai}s` }}
              />
            </g>
          ))}
          <circle
            className="cm-dot"
            cx={YAOUNDE.x}
            cy={YAOUNDE.y}
            r="4.5"
            fill="#fff"
            style={{ animationDelay: "5.4s" }}
          />
          <text
            className="cm-dot"
            x={YAOUNDE.x + 6}
            y={YAOUNDE.y + 3}
            fill="#fff"
            fontSize="8.5"
            fontFamily="Inter"
            style={{ animationDelay: "5.4s" }}
          >
            Yaoundé
          </text>
        </svg>
      </div>

      {/* Carte flottante : coursier */}
      <div
        className="coli-carte coli-carte-1 absolute top-24 right-8 rounded-xl px-3 py-2 border z-[3] hidden md:flex items-center gap-2"
        style={{
          background: "rgba(255,255,255,.07)",
          borderColor: "rgba(255,255,255,.09)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white bg-coli-vert">
          FT
        </div>
        <div>
          <div className="text-white text-[11px] font-medium">Felix TANZI</div>
          <div className="text-coli-vert text-[9px] flex items-center gap-1">
            <i className="ti ti-circle-check text-[10px]" />
            Mvog-Ada · {t("carte.valide")}
          </div>
        </div>
      </div>

      {/* Carte flottante : entreprise */}
      <div
        className="coli-carte coli-carte-2 absolute bottom-24 right-16 rounded-xl px-3 py-2 border z-[3] hidden md:flex items-center gap-2"
        style={{
          background: "rgba(255,255,255,.07)",
          borderColor: "rgba(255,255,255,.09)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white bg-coli-orange">
          ES
        </div>
        <div>
          <div className="text-white text-[11px] font-medium">Express SARL</div>
          <div
            className="text-[9px] flex items-center gap-1"
            style={{ color: "#F0997B" }}
          >
            <i className="ti ti-clock text-[10px]" />
            Bastos · {t("carte.attente")}
          </div>
        </div>
      </div>
    </>
  );
}
