import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { creerCoursier, creerPartenaire, type NouveauCoursier, type NouveauPartenaire } from '../../api/recensement';
import { CadreFormulaire } from '../../composants/formulaire/CadreFormulaire';
import {
  BlocEtape,
  ChampBascule,
  ChampChoix,
  ChampTexte,
} from '../../composants/formulaire/Champs';
import { ChampTelephone } from '../../composants/formulaire/ChampTelephone';
import { BoutonGps } from '../../composants/formulaire/BoutonGps';
import { EcranSucces } from '../../composants/formulaire/EcranSucces';
import { PanneauContexte } from '../../composants/formulaire/PanneauContexte';
import {
  cniValide,
  detecterOperateur,
  mobileMoneyValide,
  nettoyerNumero,
  nomValide,
  telephoneValide,
} from '../../composants/formulaire/validation';
import { ChampSuggestions } from '../../composants/formulaire/ChampSuggestions';
import {
  MARQUES_MOTO,
  MARQUES_VOITURE,
  quartiersDe,
  VILLES_CAMEROUN,
} from '../../composants/formulaire/donnees';
import { ajouterEnLocal } from '../../api/fileLocale';

function couleurAvatar(nom: string): string {
  const c = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let s = 0;
  for (const ch of nom || 'A') s += ch.charCodeAt(0);
  return c[s % c.length];
}

// Formate un numero pour l'apercu : 6 90 12 34 56
function formaterApercu(brut: string): string {
  const n = nettoyerNumero(brut).replace(/^\+237/, '');
  if (n.length === 0) return '';
  const reste = n.slice(1).replace(/(\d{2})(?=\d)/g, '$1 ');
  return `${n[0]} ${reste}`.trim();
}

type Gps = { lat: number; lng: number } | null;

interface Etat {
  nom: string;
  telephone: string;
  cni: string;
  ville: string;
  quartier: string;
  typeVehicule: string;
  plaque: string;
  marqueModele: string;
  aPermis: boolean;
  permisCategorie: string;
  aCarteGrise: boolean;
  aAssurance: boolean;
  aCarteSmt: boolean;
  momoNumero: string;
  momoOperateur: string;
  sigle: string;
  niu: string;
  registreCommerce: string;
  responsableNom: string;
  responsableTelephone: string;
  responsableEmail: string;
  adresse: string;
}

const ETAT_INITIAL: Etat = {
  nom: '', telephone: '', cni: '', ville: '', quartier: '',
  typeVehicule: '', plaque: '', marqueModele: '',
  aPermis: false, permisCategorie: '', aCarteGrise: false,
  aAssurance: false, aCarteSmt: false, momoNumero: '', momoOperateur: '',
  sigle: '', niu: '', registreCommerce: '', responsableNom: '',
  responsableTelephone: '', responsableEmail: '', adresse: '',
};

// Un vehicule avec plaque/permis (tout sauf a pied).
function vehiculeAvecPlaque(type: string): boolean {
  return type !== '' && type !== 'A_PIED';
}

export function Recenser() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const type = params.get('type') === 'partenaire' ? 'partenaire' : 'coursier';

  const [etape, setEtape] = useState(0);
  const [etat, setEtat] = useState<Etat>(ETAT_INITIAL);
  const [gps, setGps] = useState<Gps>(null);
  const [fini, setFini] = useState(false);
  const [dernierLocal, setDernierLocal] = useState(false);

  const set = <K extends keyof Etat>(cle: K, val: Etat[K]) =>
    setEtat((e) => ({ ...e, [cle]: val }));

  const creation = useMutation({
    networkMode: 'always',
    mutationFn: async () => {
      // Construit les données selon le type.
      const donnees =
        type === 'coursier'
          ? {
              nom: etat.nom.trim(),
              telephone: nettoyerNumero(etat.telephone),
              cni: etat.cni.trim() || undefined,
              ville: etat.ville.trim() || undefined,
              quartier: etat.quartier.trim() || undefined,
              typeVehicule: etat.typeVehicule,
              plaque: vehiculeAvecPlaque(etat.typeVehicule) && etat.plaque.trim() ? etat.plaque.trim() : undefined,
              marqueModele: vehiculeAvecPlaque(etat.typeVehicule) && etat.marqueModele.trim() ? etat.marqueModele.trim() : undefined,
              aPermis: vehiculeAvecPlaque(etat.typeVehicule) ? etat.aPermis : false,
              permisCategorie: etat.aPermis && etat.permisCategorie ? etat.permisCategorie : undefined,
              aCarteGrise: vehiculeAvecPlaque(etat.typeVehicule) ? etat.aCarteGrise : false,
              aAssurance: vehiculeAvecPlaque(etat.typeVehicule) ? etat.aAssurance : false,
              aCarteSmt: etat.aCarteSmt,
              mobileMoneyNumero: etat.momoNumero ? nettoyerNumero(etat.momoNumero) : undefined,
              mobileMoneyOperateur: detecterOperateur(etat.momoNumero) ?? undefined,
              latitude: gps?.lat,
              longitude: gps?.lng,
            }
          : {
              nom: etat.nom.trim(),
              sigle: etat.sigle.trim() || undefined,
              niu: etat.niu.trim() || undefined,
              registreCommerce: etat.registreCommerce.trim() || undefined,
              responsableNom: etat.responsableNom.trim(),
              responsableTelephone: nettoyerNumero(etat.responsableTelephone),
              responsableEmail: etat.responsableEmail.trim() || undefined,
              ville: etat.ville.trim() || undefined,
              quartier: etat.quartier.trim() || undefined,
              adresse: etat.adresse.trim() || undefined,
              mobileMoneyNumero: etat.momoNumero ? nettoyerNumero(etat.momoNumero) : undefined,
              mobileMoneyOperateur: detecterOperateur(etat.momoNumero) ?? undefined,
              latitude: gps?.lat,
              longitude: gps?.lng,
            };

      // Hors-ligne : on garde en local, la synchro se fera au retour du réseau.
      if (!navigator.onLine) {
        ajouterEnLocal({
          categorie: type,
          donnees,
          apercu: {
            nom: etat.nom.trim(),
            type: type === 'coursier' ? etat.typeVehicule : 'Partenaire',
            lieu: etat.ville.trim() || '—',
          },
        });
        return { local: true };
      }

      // En ligne : envoi normal au serveur.
      if (type === 'coursier') {
        await creerCoursier(donnees as NouveauCoursier);
      } else {
        await creerPartenaire(donnees as NouveauPartenaire);
      }
      return { local: false };
    },
    onSuccess: (res) => {
      setDernierLocal(res.local);
      setFini(true);
    },
  });

  const avecPlaque = vehiculeAvecPlaque(etat.typeVehicule);
  // L'opérateur Mobile Money se déduit du numéro saisi.
  const operateurDetecte = detecterOperateur(etat.momoNumero);

  // Marques proposées selon le type de véhicule choisi.
  const marquesProposees =
    etat.typeVehicule === 'VOITURE' || etat.typeVehicule === 'CAMIONNETTE'
      ? MARQUES_VOITURE
      : MARQUES_MOTO;

  // Quartiers proposés selon la ville saisie.
  const quartiersProposes = quartiersDe(etat.ville);

  const etapes = useMemo(() => {
    if (type === 'coursier') {
      return [
        // 1. Identité
        {
          nom: t('recensement.identite'),
          valide: nomValide(etat.nom) && telephoneValide(etat.telephone) && cniValide(etat.cni),
          rendu: (
            <BlocEtape icone="ti-user" titre={t('recensement.identite')} sousTitre={t('recensement.identiteSous')}>
              <ChampTexte
                label={t('recensement.nomCoursier')} valeur={etat.nom}
                onChange={(v) => set('nom', v)} icone="ti-user" requis
                valide={nomValide(etat.nom)}
                messageErreur={t('validation.nomCourt')}
              />
              <ChampTelephone
                label={t('recensement.telephone')} valeur={etat.telephone}
                onChange={(v) => set('telephone', v)} requis
                aide={t('validation.telAide')}
                valide={telephoneValide(etat.telephone)}
                messageErreur={t('validation.telErreur')}
              />
              <ChampTexte
                label={t('recensement.cni')} valeur={etat.cni}
                onChange={(v) => set('cni', v)} icone="ti-id"
                maxLength={20}
                aide={t('validation.cniAide')}
                valide={cniValide(etat.cni)}
                messageErreur={t('validation.cniErreur')}
              />
            </BlocEtape>
          ),
        },
        // 2. Véhicule
        {
          nom: t('recensement.vehicule'),
          valide: etat.typeVehicule !== '',
          rendu: (
            <BlocEtape icone="ti-motorbike" titre={t('recensement.vehicule')} sousTitre={t('recensement.vehiculeSous')}>
              <ChampChoix
                label={t('recensement.typeVehicule')} valeur={etat.typeVehicule}
                onChange={(v) => set('typeVehicule', v)} requis colonnes={5}
                options={[
                  { valeur: 'MOTO', libelle: 'Moto', icone: 'ti-motorbike' },
                  { valeur: 'TRICYCLE', libelle: 'Tricycle', icone: 'ti-motorbike' },
                  { valeur: 'VOITURE', libelle: 'Voiture', icone: 'ti-car' },
                  { valeur: 'CAMIONNETTE', libelle: 'Camionnette', icone: 'ti-truck' },
                  { valeur: 'A_PIED', libelle: 'À pied', icone: 'ti-walk' },
                ]}
              />
              {avecPlaque && (
                <div className="ag-anim">
                  <ChampTexte label={t('recensement.plaque')} valeur={etat.plaque} onChange={(v) => set('plaque', v)} icone="ti-hash" placeholder="CE 123 AB" />
                  <ChampSuggestions
                    label={t('recensement.marqueModele')}
                    valeur={etat.marqueModele}
                    onChange={(v) => set('marqueModele', v)}
                    suggestions={marquesProposees}
                    icone="ti-settings"
                    placeholder="Ex : Sanili 125"
                    aide={t('recensement.marqueAide')}
                  />
                  <ChampBascule label={t('recensement.aPermis')} valeur={etat.aPermis} onChange={(v) => set('aPermis', v)} />
                  {etat.aPermis && (
                    <div className="ag-anim">
                      <ChampChoix
                        label={t('recensement.permisCategorie')} valeur={etat.permisCategorie}
                        onChange={(v) => set('permisCategorie', v)} colonnes={5}
                        options={[
                          { valeur: 'A', libelle: 'A' }, { valeur: 'B', libelle: 'B' },
                          { valeur: 'C', libelle: 'C' }, { valeur: 'D', libelle: 'D' },
                          { valeur: 'E', libelle: 'E' },
                        ]}
                      />
                    </div>
                  )}
                  <ChampBascule label={t('recensement.aCarteGrise')} valeur={etat.aCarteGrise} onChange={(v) => set('aCarteGrise', v)} />
                  <ChampBascule label={t('recensement.aAssurance')} valeur={etat.aAssurance} onChange={(v) => set('aAssurance', v)} />
                </div>
              )}
              {(etat.typeVehicule === 'MOTO' || etat.typeVehicule === 'TRICYCLE') && (
                <div className="ag-anim">
                  <ChampBascule label={t('recensement.aCarteSmt')} valeur={etat.aCarteSmt} onChange={(v) => set('aCarteSmt', v)} />
                </div>
              )}
            </BlocEtape>
          ),
        },
        // 3. Localisation
        {
          nom: t('recensement.localisation'),
          valide: true,
          rendu: (
            <BlocEtape icone="ti-map-pin" titre={t('recensement.localisation')} sousTitre={t('recensement.localisationSous')}>
              <ChampSuggestions
                label={t('recensement.ville')}
                valeur={etat.ville}
                onChange={(v) => {
                  set('ville', v);
                  set('quartier', ''); // réinitialise le quartier quand la ville change
                }}
                suggestions={VILLES_CAMEROUN}
                icone="ti-building"
                placeholder="Yaoundé"
              />
              <ChampSuggestions
                label={t('recensement.quartier')}
                valeur={etat.quartier}
                onChange={(v) => set('quartier', v)}
                suggestions={quartiersProposes}
                icone="ti-map-2"
                placeholder="Mvog-Ada"
                aide={quartiersProposes.length > 0 ? t('recensement.quartierAide') : undefined}
              />
              <BoutonGps position={gps} onPosition={setGps} />
            </BlocEtape>
          ),
        },
        // 4. Paiement
        {
          nom: t('recensement.paiement'),
          valide: mobileMoneyValide(etat.momoNumero),
          rendu: (
            <BlocEtape icone="ti-wallet" titre={t('recensement.paiement')} sousTitre={t('recensement.paiementSous')}>
              <ChampTelephone
                label={t('recensement.momoNumero')} valeur={etat.momoNumero}
                onChange={(v) => set('momoNumero', v)}
                aide={t('validation.momoAide')}
                valide={etat.momoNumero.trim() === '' ? undefined : mobileMoneyValide(etat.momoNumero)}
                messageErreur={t('validation.momoErreur')}
                montrerOperateur
              />
              <OperateurDetecte operateur={operateurDetecte} />
            </BlocEtape>
          ),
        },
      ];
    }

    // PARTENAIRE
    return [
      {
        nom: t('recensement.entreprise'),
        valide: nomValide(etat.nom),
        rendu: (
          <BlocEtape icone="ti-building-store" titre={t('recensement.entreprise')} sousTitre={t('recensement.entrepriseSous')}>
            <ChampTexte label={t('recensement.nomEntreprise')} valeur={etat.nom} onChange={(v) => set('nom', v)} icone="ti-building-store" requis valide={nomValide(etat.nom)} messageErreur={t('validation.nomCourt')} />
            <ChampTexte label={t('recensement.sigle')} valeur={etat.sigle} onChange={(v) => set('sigle', v)} icone="ti-tag" />
            <ChampTexte label={t('recensement.niu')} valeur={etat.niu} onChange={(v) => set('niu', v)} icone="ti-id-badge-2" />
            <ChampTexte label={t('recensement.registreCommerce')} valeur={etat.registreCommerce} onChange={(v) => set('registreCommerce', v)} icone="ti-file-certificate" />
          </BlocEtape>
        ),
      },
      {
        nom: t('recensement.responsable'),
        valide: nomValide(etat.responsableNom) && telephoneValide(etat.responsableTelephone),
        rendu: (
          <BlocEtape icone="ti-user" titre={t('recensement.responsable')} sousTitre={t('recensement.responsableSous')}>
            <ChampTexte label={t('recensement.responsableNom')} valeur={etat.responsableNom} onChange={(v) => set('responsableNom', v)} icone="ti-user" requis valide={nomValide(etat.responsableNom)} messageErreur={t('validation.nomCourt')} />
            <ChampTelephone
              label={t('recensement.responsableTelephone')} valeur={etat.responsableTelephone}
              onChange={(v) => set('responsableTelephone', v)} requis
              aide={t('validation.telAide')}
              valide={telephoneValide(etat.responsableTelephone)}
              messageErreur={t('validation.telErreur')}
            />
            <ChampTexte label={t('recensement.responsableEmail')} valeur={etat.responsableEmail} onChange={(v) => set('responsableEmail', v)} icone="ti-mail" type="email" />
          </BlocEtape>
        ),
      },
      {
        nom: t('recensement.localisation'),
        valide: true,
        rendu: (
          <BlocEtape icone="ti-map-pin" titre={t('recensement.localisation')} sousTitre={t('recensement.localisationSous')}>
            <ChampSuggestions
              label={t('recensement.ville')}
              valeur={etat.ville}
              onChange={(v) => {
                set('ville', v);
                set('quartier', '');
              }}
              suggestions={VILLES_CAMEROUN}
              icone="ti-building"
              placeholder="Douala"
            />
            <ChampSuggestions
              label={t('recensement.quartier')}
              valeur={etat.quartier}
              onChange={(v) => set('quartier', v)}
              suggestions={quartiersProposes}
              icone="ti-map-2"
              placeholder="Akwa"
              aide={quartiersProposes.length > 0 ? t('recensement.quartierAide') : undefined}
            />
            <ChampTexte label={t('recensement.adresse')} valeur={etat.adresse} onChange={(v) => set('adresse', v)} icone="ti-map-pin" />
            <BoutonGps position={gps} onPosition={setGps} />
          </BlocEtape>
        ),
      },
      {
        nom: t('recensement.paiement'),
        valide: mobileMoneyValide(etat.momoNumero),
        rendu: (
          <BlocEtape icone="ti-wallet" titre={t('recensement.paiement')} sousTitre={t('recensement.paiementSous')}>
            <ChampTelephone
              label={t('recensement.momoNumero')} valeur={etat.momoNumero}
              onChange={(v) => set('momoNumero', v)}
              aide={t('validation.momoAide')}
              valide={etat.momoNumero.trim() === '' ? undefined : mobileMoneyValide(etat.momoNumero)}
              messageErreur={t('validation.momoErreur')}
              montrerOperateur
            />
            <OperateurDetecte operateur={operateurDetecte} />
          </BlocEtape>
        ),
      },
    ];
  }, [type, etat, gps, avecPlaque, operateurDetecte, marquesProposees, quartiersProposes, t]);

  if (fini) {
    return (
      <EcranSucces
        estLocal={dernierLocal}
        onNouveau={() => {
          setEtat(ETAT_INITIAL);
          setGps(null);
          setEtape(0);
          setFini(false);
          setDernierLocal(false);
          creation.reset();
        }}
      />
    );
  }

  const courante = etapes[etape];
  const estDerniere = etape === etapes.length - 1;

  const suivant = () => {
    if (!courante.valide) return;
    if (estDerniere) creation.mutate();
    else setEtape((e) => e + 1);
  };

  return (
    <CadreFormulaire
      titre={type === 'coursier' ? t('recensement.coursierTitre') : t('recensement.partenaireTitre')}
      etapes={etapes.map((e) => e.nom)}
      etapeCourante={etape}
      peutContinuer={courante.valide}
      enCours={creation.isPending}
      estDerniere={estDerniere}
      panneauContexte={
        <PanneauContexte
          nom={etat.nom}
          telephone={formaterApercu(etat.telephone)}
          couleurAvatar={couleurAvatar(etat.nom)}
          ville={etat.ville}
          quartier={etat.quartier}
          gps={gps}
        />
      }
      onPrecedent={() => setEtape((e) => Math.max(0, e - 1))}
      onSuivant={suivant}
    >
      {courante.rendu}
      {creation.isError && (
        <p className="text-sm text-red-600 mt-3 flex items-center gap-1.5">
          <i className="ti ti-alert-circle" />
          {t('recensement.erreur')}
        </p>
      )}
    </CadreFormulaire>
  );
}

// Affiche l'opérateur détecté automatiquement (lecture seule).
function OperateurDetecte({ operateur }: { operateur: 'MTN' | 'ORANGE' | null }) {
  const { t } = useTranslation();

  if (!operateur) {
    return (
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          {t('recensement.momoOperateur')}
        </label>
        <div className="py-3 px-4 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 flex items-center gap-2">
          <i className="ti ti-wand" />
          {t('recensement.operateurAuto')}
        </div>
      </div>
    );
  }

  const estMtn = operateur === 'MTN';
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {t('recensement.momoOperateur')}
      </label>
      <div
        className="py-3 px-4 rounded-xl border-2 flex items-center gap-2.5 transition-all"
        style={{
          borderColor: estMtn ? '#FFCC00' : '#FF6600',
          background: estMtn ? '#FFFBEB' : '#FFF4EC',
        }}
      >
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded"
          style={{ background: estMtn ? '#FFCC00' : '#FF6600', color: estMtn ? '#0E1A24' : '#fff' }}
        >
          {operateur}
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <i className="ti ti-circle-check text-coli-vert" />
          {t('recensement.operateurDetecte')}
        </span>
      </div>
    </div>
  );
}