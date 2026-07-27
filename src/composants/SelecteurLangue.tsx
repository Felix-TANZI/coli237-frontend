import { useTranslation } from "react-i18next";

// Bascule FR/EN. "clair" pour l'afficher sur fond sombre (verre).
export function SelecteurLangue({ clair = false }: { clair?: boolean }) {
  const { i18n } = useTranslation();
  const langue = i18n.language.startsWith("en") ? "en" : "fr";

  const changer = (l: string) => {
    void i18n.changeLanguage(l);
  };

  const fond = clair ? "rgba(255,255,255,.1)" : "#f1f5f6";

  return (
    <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: fond }}>
      {(["fr", "en"] as const).map((l) => {
        const actif = langue === l;
        return (
          <button
            key={l}
            onClick={() => changer(l)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition"
            style={
              actif
                ? {
                    background: clair ? "rgba(255,255,255,.92)" : "#fff",
                    color: "#0E1A24",
                  }
                : { color: clair ? "rgba(255,255,255,.6)" : "#9aa8b0" }
            }
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
