import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listerCompagnies } from '../../api/compagnies';
import { ajouterEnLocal } from '../../api/fileLocale';
import { creerPersonne, type NouvellePersonne, type RolePersonne } from '../../api/personnes';
import { ChampTelephone } from '../../composants/formulaire/ChampTelephone';
import { EcranSucces } from '../../composants/formulaire/EcranSucces';
import { nettoyerNumero } from '../../composants/formulaire/validation';
import { NavAgentBas, NavAgentHaut } from '../../composants/NavAgent';
import { agentConnecte } from '../../api/auth';
import { LISTE_ROLES, ROLES } from '../../composants/roles';

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

const STATUTS_CHAUFFEUR = ['EN_ATTENTE', 'DISPONIBLE', 'OCCUPE', 'HORS_LIGNE', 'SUSPENDU'];
const VEHICULES = ['MOTO', 'TRICYCLE', 'VOITURE', 'CAMIONNETTE', 'AUTRE'];

interface Etat {
  role: RolePersonne;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
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
  typeVehicule: '',
  typeVehiculeAutre: '',
  plaque: '',
  compagnieId: '',
  statutChauffeur: 'EN_ATTENTE',
};

export function Recenser() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const moi = agentConnecte();
  const [etat, setEtat] = useState<Etat>(INITIAL);
  const [fini, setFini] = useState(false);
  const [dernierLocal, setDernierLocal] = useState(false);

  const set = <K extends keyof Etat>(cle: K, val: Etat[K]) =>
    setEtat((e) => ({ ...e, [cle]: val }));

  const { data: compagnies = [] } = useQuery({
    queryKey: ['compagnies'],
    queryFn: listerCompagnies,
  });

  const creation = useMutation({
    networkMode: 'always',
    mutationFn: async () => {
      const donnees: NouvellePersonne = {
        role: etat.role,
        prenom: etat.prenom.trim(),
        nom: etat.nom.trim(),
        email: etat.email.trim() || undefined,
        telephone: nettoyerNumero(etat.telephone),
      };
      if (etat.role === 'LIVREUR_AGENCE') {
        donnees.typeVehicule = etat.typeVehicule;
        if (etat.typeVehicule === 'AUTRE') donnees.typeVehiculeAutre = etat.typeVehiculeAutre.trim();
        if (etat.plaque.trim()) donnees.plaque = etat.plaque.trim();
        donnees.compagnieId = etat.compagnieId || undefined;
        donnees.statutChauffeur = etat.statutChauffeur;
      }

      // Hors-ligne : on garde en local.
      if (!navigator.onLine) {
        ajouterEnLocal({
          donnees,
          apercu: {
            nom: `${etat.prenom} ${etat.nom}`.trim(),
            role: etat.role,
            lieu: '—',
          },
        });
        return { local: true };
      }

      await creerPersonne(donnees);
      return { local: false };
    },
    onSuccess: (res) => {
      setDernierLocal(res.local);
      setFini(true);
      void qc.invalidateQueries({ queryKey: ['personnes'] });
      void qc.invalidateQueries({ queryKey: ['mesFiches'] });
      void qc.invalidateQueries({ queryKey: ['mesRecensements'] });
    },
  });

  // Validation minimale.
  const identiteOk =
    etat.prenom.trim().length >= 2 &&
    etat.nom.trim().length >= 2 &&
    nettoyerNumero(etat.telephone).length >= 9;
  const vehiculeOk = etat.role !== 'LIVREUR_AGENCE' || etat.typeVehicule !== '';
  const agenceOk = etat.role !== 'LIVREUR_AGENCE' || etat.compagnieId !== '';
  const peutCreer = identiteOk && vehiculeOk && agenceOk;

  if (fini) {
    return (
      <EcranSucces
        estLocal={dernierLocal}
        onNouveau={() => {
          setEtat(INITIAL);
          setFini(false);
          setDernierLocal(false);
          creation.reset();
        }}
      />
    );
  }

  const infoRole = ROLES[etat.role];

  return (
    <div className="min-h-screen bg-coli-craie pb-24 md:pb-0">
      <NavAgentHaut nom={moi?.nom ?? 'Agent'} />

      <div className="max-w-lg mx-auto px-4 py-5 md:px-6 md:py-8">
        {/* En-tete */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/agent')}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 transition shrink-0"
          >
            <i className="ti ti-arrow-left text-lg" />
          </button>
          <div>
            <div className="font-extrabold text-xl text-coli-encre" style={{ fontFamily: 'Sora, Inter' }}>
              Nouveau recensement
            </div>
            <div className="text-[11px] text-gray-400">Choisissez un role et remplissez la fiche</div>
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl border border-gray-200/70 p-5 md:p-6" style={{ boxShadow: OMBRE }}>
          {/* Role — menu deroulant */}
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Role</label>
          <div className="relative mb-6">
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center pointer-events-none"
              style={{ background: infoRole.couleur, color: '#fff' }}
            >
              <i className={`ti ${infoRole.icone} text-base`} />
            </div>
            <select
              value={etat.role}
              onChange={(e) => set('role', e.target.value as RolePersonne)}
              className="w-full pl-14 pr-10 py-3.5 rounded-xl border-2 outline-none text-sm font-medium bg-white appearance-none cursor-pointer"
              style={{ borderColor: infoRole.couleur, color: infoRole.couleur }}
            >
              {LISTE_ROLES.map((r) => (
                <option key={r} value={r}>{ROLES[r].libelle}</option>
              ))}
            </select>
            <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: infoRole.couleur }} />
          </div>

          {/* Identite (commun) */}
          <SousTitre icone="ti-user" texte="Identite" />
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Prenom" valeur={etat.prenom} onChange={(v) => set('prenom', v)} requis />
            <Champ label="Nom" valeur={etat.nom} onChange={(v) => set('nom', v)} requis />
          </div>
          <ChampTelephone
            label="Telephone"
            valeur={etat.telephone}
            onChange={(v) => set('telephone', v)}
            requis
          />
          <Champ label="Email (optionnel)" valeur={etat.email} onChange={(v) => set('email', v)} type="email" />

          {/* Vehicule + rattachement (livreur agence seulement) */}
          {etat.role === 'LIVREUR_AGENCE' && (
            <>
              <SousTitre icone="ti-motorbike" texte="Vehicule" />
              {/* Type de vehicule — menu deroulant */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Type de vehicule <span className="text-coli-orange">*</span>
                </label>
                <div className="relative">
                  <select
                    value={etat.typeVehicule}
                    onChange={(e) => set('typeVehicule', e.target.value)}
                    className="w-full px-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Selectionner...</option>
                    {VEHICULES.map((v) => (
                      <option key={v} value={v}>{v === 'AUTRE' ? 'Autre' : v.charAt(0) + v.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                  <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {etat.typeVehicule === 'AUTRE' && (
                <Champ label="Preciser le type" valeur={etat.typeVehiculeAutre} onChange={(v) => set('typeVehiculeAutre', v)} placeholder="Ex : Velo cargo" />
              )}
              <Champ label="Plaque" valeur={etat.plaque} onChange={(v) => set('plaque', v)} placeholder="CE 123 AB" />

              <SousTitre icone="ti-building-store" texte="Rattachement" />
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Compagnie <span className="text-coli-orange">*</span></label>
                <div className="relative">
                  <select
                    value={etat.compagnieId}
                    onChange={(e) => set('compagnieId', e.target.value)}
                    className="w-full px-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Selectionner une compagnie</option>
                    {compagnies.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                  <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {compagnies.length === 0 && (
                  <p className="text-[11px] text-coli-orange mt-1">Aucune compagnie disponible.</p>
                )}
              </div>
              <div className="mb-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Statut chauffeur</label>
                <div className="relative">
                  <select
                    value={etat.statutChauffeur}
                    onChange={(e) => set('statutChauffeur', e.target.value)}
                    className="w-full px-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white appearance-none cursor-pointer"
                  >
                    {STATUTS_CHAUFFEUR.map((s) => (
                      <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}</option>
                    ))}
                  </select>
                  <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          {/* Documents (livreur independant seulement) */}
          {etat.role === 'LIVREUR_INDEPENDANT' && (
            <>
              <SousTitre icone="ti-files" texte="Documents coursier" />
              <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center gap-3">
                <i className="ti ti-cloud-upload text-gray-400 text-xl" />
                <div className="text-xs text-gray-500">
                  Les documents (CNI, permis...) pourront etre ajoutes apres l'enregistrement de la fiche.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bouton enregistrer */}
        <button
          onClick={() => creation.mutate()}
          disabled={!peutCreer || creation.isPending}
          className="w-full mt-4 py-3.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
          style={{ boxShadow: '0 6px 16px rgba(31,184,158,.3)' }}
        >
          {creation.isPending ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-check" />}
          Enregistrer la fiche
        </button>

        {creation.isError && (
          <p className="text-sm text-red-600 mt-3 flex items-center gap-1.5">
            <i className="ti ti-alert-circle" />
            Erreur lors de l'enregistrement
          </p>
        )}
      </div>

      <NavAgentBas />
    </div>
  );
}

// --- Sous-composants ---
function SousTitre({ icone, texte }: { icone: string; texte: string }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-3">
      <i className={`ti ${icone} text-coli-vert`} />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{texte}</span>
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
    <div className="mb-4">
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