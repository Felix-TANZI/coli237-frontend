import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Pays proposes : Cameroun + voisins. maxChiffres = longueur du numero
// national (sans indicatif). Le nom affiche vient de la traduction "pays".
const PAYS = [
  { code: 'CM', nom: 'Cameroun', indicatif: '+237', drapeau: '🇨🇲', maxChiffres: 9 },
  { code: 'TD', nom: 'Tchad', indicatif: '+235', drapeau: '🇹🇩', maxChiffres: 8 },
  { code: 'CF', nom: 'RCA', indicatif: '+236', drapeau: '🇨🇫', maxChiffres: 8 },
  { code: 'GA', nom: 'Gabon', indicatif: '+241', drapeau: '🇬🇦', maxChiffres: 8 },
  { code: 'GQ', nom: 'Guinee Eq.', indicatif: '+240', drapeau: '🇬🇶', maxChiffres: 9 },
  { code: 'CG', nom: 'Congo', indicatif: '+242', drapeau: '🇨🇬', maxChiffres: 9 },
  { code: 'NG', nom: 'Nigeria', indicatif: '+234', drapeau: '🇳🇬', maxChiffres: 10 },
];

// Champ telephone avec selecteur de pays.
// La valeur stockee est l'indicatif + le numero national, ex : "+237690123456".
export function ChampTelephone({
  label,
  valeur,
  onChange,
  requis = false,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  requis?: boolean;
}) {
  const { t } = useTranslation();
  const [codePays, setCodePays] = useState('CM');
  const pays = PAYS.find((p) => p.code === codePays) ?? PAYS[0];

  // Numero national = valeur sans l'indicatif du pays choisi.
  const numeroNational = valeur.replace(pays.indicatif, '').replace(/\D/g, '');

  const valide = numeroNational.length === pays.maxChiffres;
  const aSaisi = numeroNational.length > 0;
  const montrerCoche = aSaisi && valide;
  const montrerErreur = aSaisi && !valide;

  // Affichage : groupes de 2 chiffres pour la lisibilite.
  const afficher = (n: string) => {
    if (n.length === 0) return '';
    const reste = n.slice(1).replace(/(\d{2})(?=\d)/g, '$1 ');
    return `${n[0]} ${reste}`.trim();
  };

  const surSaisie = (saisi: string) => {
    const chiffres = saisi.replace(/\D/g, '').slice(0, pays.maxChiffres);
    onChange(chiffres ? `${pays.indicatif}${chiffres}` : '');
  };

  const surChangementPays = (code: string) => {
    setCodePays(code);
    const nouveauPays = PAYS.find((p) => p.code === code) ?? PAYS[0];
    // On garde les chiffres deja saisis (tronques si besoin).
    const chiffres = numeroNational.slice(0, nouveauPays.maxChiffres);
    onChange(chiffres ? `${nouveauPays.indicatif}${chiffres}` : '');
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {requis && <span className="text-coli-orange ml-0.5">*</span>}
      </label>
      <div className="flex gap-2">
        {/* Selecteur de pays */}
        <div className="relative shrink-0">
          <select
            value={codePays}
            onChange={(e) => surChangementPays(e.target.value)}
            className="h-full pl-3 pr-8 rounded-xl border-2 border-gray-200 bg-white text-sm outline-none appearance-none cursor-pointer focus:border-coli-cyan"
          >
            {PAYS.map((p) => (
              <option key={p.code} value={p.code}>
                {p.drapeau} {p.indicatif}
              </option>
            ))}
          </select>
          <i className="ti ti-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
        </div>

        {/* Champ numero */}
        <div className="relative flex-1">
          <input
            type="tel"
            inputMode="numeric"
            value={afficher(numeroNational)}
            onChange={(e) => surSaisie(e.target.value)}
            placeholder="6 90 12 34 56"
            required={requis}
            className={`w-full pl-4 pr-10 py-3 rounded-xl border-2 outline-none transition text-sm bg-white ${
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
          {montrerErreur && (
            <i className="ti ti-alert-circle absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-lg" />
          )}
        </div>
      </div>
      {montrerErreur && (
        <p className="text-[11px] text-red-500 mt-1">
          {t('formulaire.telErreur', {
            n: pays.maxChiffres,
            pays: t(`pays.${pays.code}`, { defaultValue: pays.nom }),
          })}
        </p>
      )}
    </div>
  );
}