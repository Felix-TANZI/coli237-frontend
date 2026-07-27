import { useState } from "react";
import { useTranslation } from "react-i18next";

// Fenetre de creation d'un agent.
export function ModaleCreerAgent({
  onFermer,
  onCreer,
  enCours,
}: {
  onFermer: () => void;
  onCreer: (v: { nom: string; telephone: string; email: string }) => void;
  enCours: boolean;
}) {
  const { t } = useTranslation();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2
            className="font-extrabold text-lg text-coli-encre"
            style={{ fontFamily: "Sora, Inter" }}
          >
            {t("agents.creerTitre")}
          </h2>
          <button
            onClick={onFermer}
            aria-label={t("agents.fermer")}
            className="text-gray-400 hover:text-coli-encre"
          >
            <i className="ti ti-x text-lg" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          {t("agents.creerSousTitre")}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreer({ nom, telephone, email });
          }}
          className="space-y-3.5"
        >
          <Champ
            label={t("agents.nom")}
            valeur={nom}
            set={setNom}
            icone="ti-user"
          />
          <Champ
            label={t("agents.telephone")}
            valeur={telephone}
            set={setTelephone}
            icone="ti-phone"
            type="tel"
          />
          <Champ
            label={t("agents.email")}
            valeur={email}
            set={setEmail}
            icone="ti-mail"
            type="email"
          />

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onFermer}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
            >
              {t("agents.annuler")}
            </button>
            <button
              type="submit"
              disabled={enCours}
              className="flex-1 py-2.5 rounded-xl bg-coli-orange text-white font-semibold text-sm hover:bg-coli-orange-fonce disabled:opacity-60 transition"
            >
              {enCours ? t("agents.creation") : t("agents.creer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Fenetre qui affiche le mot de passe temporaire (creation ou reinit).
export function ModaleMotDePasse({
  motDePasse,
  reinit,
  onFermer,
}: {
  motDePasse: string;
  reinit: boolean;
  onFermer: () => void;
}) {
  const { t } = useTranslation();
  const [copie, setCopie] = useState(false);

  const copier = () => {
    void navigator.clipboard.writeText(motDePasse);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-coli-vert flex items-center justify-center mx-auto mb-3">
          <i className="ti ti-circle-check text-2xl" />
        </div>
        <h2
          className="font-extrabold text-lg text-coli-encre"
          style={{ fontFamily: "Sora, Inter" }}
        >
          {reinit ? t("agents.mdpReinit") : t("agents.mdpTitre")}
        </h2>
        <p className="text-xs text-gray-500 mt-1.5 mb-4">
          {t("agents.mdpTexte")}
        </p>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
          <code className="flex-1 text-base font-mono font-semibold text-coli-encre tracking-wide">
            {motDePasse}
          </code>
          <button
            onClick={copier}
            className="text-coli-cyan hover:text-coli-vert transition flex items-center gap-1 text-xs font-semibold"
          >
            <i className={`ti ${copie ? "ti-check" : "ti-copy"}`} />
            {copie ? t("agents.copie") : t("agents.copier")}
          </button>
        </div>

        <button
          onClick={onFermer}
          className="w-full py-2.5 rounded-xl bg-coli-encre text-white font-semibold text-sm hover:opacity-90 transition"
        >
          {t("agents.fermer")}
        </button>
      </div>
    </div>
  );
}

function Champ({
  label,
  valeur,
  set,
  icone,
  type = "text",
}: {
  label: string;
  valeur: string;
  set: (v: string) => void;
  icone: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <i
          className={`ti ${icone} absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base`}
        />
        <input
          type={type}
          value={valeur}
          onChange={(e) => set(e.target.value)}
          required
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 outline-none transition text-sm"
        />
      </div>
    </div>
  );
}
