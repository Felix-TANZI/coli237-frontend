import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { listerCompagnies } from '../../api/compagnies';
import { creerPersonne, type NouvellePersonne, type RolePersonne } from '../../api/personnes';
import { estLivreur, LISTE_ROLES, ROLES } from '../../composants/roles';

const STATUTS_CHAUFFEUR = ['EN_ATTENTE', 'DISPONIBLE', 'OCCUPE', 'HORS_LIGNE', 'SUSPENDU'];
const VEHICULES = [
  { valeur: 'MOTO', libelle: 'Moto', icone: 'ti-motorbike' },
  { valeur: 'TRICYCLE', libelle: 'Tricycle', icone: 'ti-motorbike' },
  { valeur: 'VOITURE', libelle: 'Voiture', icone: 'ti-car' },
  { valeur: 'CAMIONNETTE', libelle: 'Camionnette', icone: 'ti-truck' },
  { valeur: 'A_PIED', libelle: 'A pied', icone: 'ti-walk' },
  { valeur: 'AUTRE', libelle: 'Autre', icone: 'ti-dots' },
];

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

interface Etat {
  role: RolePersonne;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  quartier: string;
  typeVehicule: string;
  typeVehiculeAutre: string;
  plaque: string;
  compagnieId: string;
  statutChauffeur: string;
}

const INITIAL: Etat = {
  role: 'LIVREUR_INDEPENDANT',
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  ville: '',
  quartier: '',
  typeVehicule: '',
  typeVehiculeAutre: '',
  plaque: '',
  compagnieId: '',
  statutChauffeur: 'EN_ATTENTE',
};

export function ModaleUtilisateur({ onFermer }: { onFermer: () => void }) {
  const qc = useQueryClient();
  const [etat, setEtat] = useState<Etat>(INITIAL);

  const set = <K extends keyof Etat>(cle: K, val: Etat[K]) =>
    setEtat((e) => ({ ...e, [cle]: val }));

  const { data: compagnies = [] } = useQuery({
    queryKey: ['compagnies'],
    queryFn: listerCompagnies,
  });

  const creation = useMutation({
    mutationFn: () => {
      const donnees: NouvellePersonne = {
        role: etat.role,
        prenom: etat.prenom.trim(),
        nom: etat.nom.trim(),
        email: etat.email.trim() || undefined,
        telephone: etat.telephone.replace(/\s/g, ''),
        ville: etat.ville.trim() || undefined,
        quartier: etat.quartier.trim() || undefined,
      };
      if (estLivreur(etat.role)) {
        donnees.typeVehicule = etat.typeVehicule;
        if (etat.typeVehicule === 'AUTRE') donnees.typeVehiculeAutre = etat.typeVehiculeAutre.trim();
        donnees.plaque = etat.plaque.trim() || undefined;
      }
      if (etat.role === 'LIVREUR_AGENCE') {
        donnees.compagnieId = etat.compagnieId || undefined;
        donnees.statutChauffeur = etat.statutChauffeur;
      }
      return creerPersonne(donnees);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['personnes'] });
      onFermer();
    },
  });

  // Validation minimale pour activer le bouton.
  const identiteOk = etat.prenom.trim().length >= 2 && etat.nom.trim().length >= 2 && etat.telephone.trim().length >= 8;
  const vehiculeOk = !estLivreur(etat.role) || etat.typeVehicule !== '';
  const agenceOk = etat.role !== 'LIVREUR_AGENCE' || etat.compagnieId !== '';
  const peutCreer = identiteOk && vehiculeOk && agenceOk;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8" style={{ boxShadow: '0 20px 60px rgba(14,26,36,.25)' }}>
        {/* En-tete */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="font-extrabold text-lg text-coli-encre" style={{ fontFamily: 'Sora, Inter' }}>
              Nouvel utilisateur
            </div>
            <div className="text-xs text-gray-400">Recensement d'une personne</div>
          </div>
          <button onClick={onFermer} className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center transition">
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* Choix du role */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Role</label>
            <div className="grid grid-cols-2 gap-2.5">
              {LISTE_ROLES.map((r) => {
                const info = ROLES[r];
                const actif = etat.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => set('role', r)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border-2 transition text-left"
                    style={{
                      borderColor: actif ? info.couleur : '#eceff1',
                      background: actif ? info.fond : '#fff',
                    }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: actif ? info.couleur : '#f2f5f7', color: actif ? '#fff' : '#8a99a3' }}>
                      <i className={`ti ${info.icone} text-lg`} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: actif ? info.couleur : '#5a6b75' }}>
                      {info.libelle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identite (commun) */}
          <Section titre="Identite" icone="ti-user">
            <div className="grid grid-cols-2 gap-3">
              <Champ label="Prenom" valeur={etat.prenom} onChange={(v) => set('prenom', v)} requis />
              <Champ label="Nom" valeur={etat.nom} onChange={(v) => set('nom', v)} requis />
            </div>
            <Champ label="Email (optionnel)" valeur={etat.email} onChange={(v) => set('email', v)} type="email" />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Telephone <span className="text-coli-orange">*</span></label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 rounded-xl border-2 border-gray-200 bg-white text-sm shrink-0">
                  <span className="text-lg">🇨🇲</span>
                  <span className="text-gray-600 font-medium">+237</span>
                </div>
                <input
                  value={etat.telephone}
                  onChange={(e) => set('telephone', e.target.value)}
                  placeholder="6 90 12 34 56"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 outline-none text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Champ label="Ville" valeur={etat.ville} onChange={(v) => set('ville', v)} placeholder="Yaounde" />
              <Champ label="Quartier" valeur={etat.quartier} onChange={(v) => set('quartier', v)} placeholder="Bastos" />
            </div>
          </Section>

          {/* Vehicule (livreurs) */}
          {estLivreur(etat.role) && (
            <Section titre="Vehicule" icone="ti-motorbike">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Type de vehicule <span className="text-coli-orange">*</span></label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {VEHICULES.map((v) => {
                  const actif = etat.typeVehicule === v.valeur;
                  return (
                    <button
                      key={v.valeur}
                      onClick={() => set('typeVehicule', v.valeur)}
                      className="flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition"
                      style={{ borderColor: actif ? '#1FB89E' : '#eceff1', background: actif ? '#e8f8f3' : '#fff' }}
                    >
                      <i className={`ti ${v.icone} text-xl`} style={{ color: actif ? '#1FB89E' : '#8a99a3' }} />
                      <span className="text-xs" style={{ color: actif ? '#0F6E56' : '#5a6b75' }}>{v.libelle}</span>
                    </button>
                  );
                })}
              </div>
              {etat.typeVehicule === 'AUTRE' && (
                <Champ label="Preciser le type" valeur={etat.typeVehiculeAutre} onChange={(v) => set('typeVehiculeAutre', v)} placeholder="Ex : Velo cargo" />
              )}
              {etat.typeVehicule !== 'A_PIED' && etat.typeVehicule !== '' && (
                <Champ label="Plaque d'immatriculation" valeur={etat.plaque} onChange={(v) => set('plaque', v)} placeholder="CE 123 AB" />
              )}
            </Section>
          )}

          {/* Compagnie + statut chauffeur (livreur agence) */}
          {etat.role === 'LIVREUR_AGENCE' && (
            <Section titre="Rattachement" icone="ti-building-store">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Compagnie <span className="text-coli-orange">*</span></label>
                <select
                  value={etat.compagnieId}
                  onChange={(e) => set('compagnieId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white"
                >
                  <option value="">Selectionner une compagnie</option>
                  {compagnies.map((c) => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
                {compagnies.length === 0 && (
                  <p className="text-[11px] text-coli-orange mt-1">Aucune compagnie. Creez-en une d'abord dans l'onglet Compagnies.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Statut chauffeur</label>
                <select
                  value={etat.statutChauffeur}
                  onChange={(e) => set('statutChauffeur', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white"
                >
                  {STATUTS_CHAUFFEUR.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </Section>
          )}

          {/* Documents (livreur independant) */}
          {etat.role === 'LIVREUR_INDEPENDANT' && (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <i className="ti ti-files text-gray-400 text-xl" />
              <div className="text-xs text-gray-500">
                Les documents (CNI, permis...) pourront etre ajoutes apres la creation de la fiche.
              </div>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100">
          {creation.isError && (
            <span className="text-xs text-red-600 mr-auto flex items-center gap-1">
              <i className="ti ti-alert-circle" />
              Erreur lors de la creation
            </span>
          )}
          <button onClick={onFermer} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Annuler
          </button>
          <button
            onClick={() => creation.mutate()}
            disabled={!peutCreer || creation.isPending}
            className="px-5 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
            style={{ boxShadow: OMBRE }}
          >
            {creation.isPending ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-check" />}
            Creer l'utilisateur
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Sous-composants ---
function Section({ titre, icone, children }: { titre: string; icone: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <i className={`ti ${icone} text-coli-vert`} />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{titre}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Champ({
  label,
  valeur,
  onChange,
  type = 'text',
  placeholder,
  requis,
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  requis?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
        {requis && <span className="text-coli-orange ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 outline-none text-sm"
      />
    </div>
  );
}