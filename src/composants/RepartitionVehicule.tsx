import { useTranslation } from "react-i18next";

const COULEURS = [
  "#1FB89E",
  "#F28C28",
  "#17A2B8",
  "#7F77DD",
  "#D4537E",
  "#5DCAA5",
];

export function RepartitionVehicule({
  parVehicule,
}: {
  parVehicule: { type: string; nombre: number; pourcent: number }[];
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <div className="font-semibold text-sm text-coli-encre mb-4">
        {t("tableau.repartition")}
      </div>

      {parVehicule.length === 0 && (
        <p className="text-xs text-gray-400 py-4 text-center">
          {t("tableau.aucuneDonnee")}
        </p>
      )}

      <div className="space-y-3">
        {parVehicule.map((v, i) => (
          <div key={v.type}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-600">
                {t(`roles.${v.type}`, { defaultValue: v.type })}
              </span>
              <span className="font-semibold text-coli-encre">
                {v.pourcent}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${v.pourcent}%`,
                  background: COULEURS[i % COULEURS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
