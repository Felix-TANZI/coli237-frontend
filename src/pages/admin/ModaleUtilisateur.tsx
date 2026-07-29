import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listerCompagnies } from '../../api/compagnies';
import { creerPersonne, type NouvellePersonne, type RolePersonne } from '../../api/personnes';
import { ChampTelephone } from '../../composants/formulaire/ChampTelephone';
import { ChampValide } from '../../composants/formulaire/ChampValide';
import { LISTE_ROLES, ROLES } from '../../composants/roles';
import { SelecteurCompagnie } from '../../composants/SelecteurCompagnie';

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

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
};

const nomOk = (v: string) => v.trim().length >= 2;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function ModaleUtilisateur({ onFermer }: { onFermer: () => void }) {
  const { t } = useTranslation();
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
      };
      if (etat.role === 'LIVREUR_AGENCE') {
        donnees.typeVehicule = etat.typeVehicule;
        if (etat.typeVehicule === 'AUTRE') donnees.typeVehiculeAutre = etat.typeVehiculeAutre.trim();
        if (etat.plaque.trim()) donnees.plaque = etat.plaque.trim();
        donnees.compagnieId = etat.compagnieId || undefined;
      }
      return creerPersonne(donnees);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['personnes'] });
      onFermer();
    },
  });

  const identiteOk =
    nomOk(etat.prenom) && nomOk(etat.nom) && etat.telephone.replace(/\D/g, '').length >= 8;
  const vehiculeOk = etat.role !== 'LIVREUR_AGENCE' || etat.typeVehicule !== '';
  const agenceOk = etat.role !== 'LIVREUR_AGENCE' || etat.compagnieId !== '';
  const peutCreer = identiteOk && vehiculeOk && agenceOk;

  const infoRole = ROLES[etat.role];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl w-full max-w-lg my-8"
        style={{ boxShadow: '0 20px 60px rgba(14,26,36,.25)' }}
      >
        {/* En-tete */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="font-extrabold text-lg text-coli-encre" style={{ fontFamily: 'Sora, Inter' }}>
              {t('utilisateurs.modaleTitre')}
            </div>
            <div className="text-xs text-gray-400">{t('utilisateurs.modaleSousTitre')}</div>
          </div>
          <button
            onClick={onFermer}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center transition"
          >
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* Role - menu deroulant */}
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {t('formulaire.role')}
          </label>
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
                <option key={r} value={r}>{t(`roles.${r}`)}</option>
              ))}
            </select>
            <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: infoRole.couleur }} />
          </div>

          {/* Identite */}
          <SousTitre icone="ti-user" texte={t('formulaire.identite')} />
          <div className="grid grid-cols-2 gap-3">
            <ChampValide
              label={t('formulaire.prenom')}
              valeur={etat.prenom}
              onChange={(v) => set('prenom', v)}
              valide={nomOk}
              requis
            />
            <ChampValide
              label={t('formulaire.nom')}
              valeur={etat.nom}
              onChange={(v) => set('nom', v)}
              valide={nomOk}
              requis
            />
          </div>
          <ChampTelephone
            label={t('formulaire.telephone')}
            valeur={etat.telephone}
            onChange={(v) => set('telephone', v)}
            requis
          />
          <ChampValide
            label={t('formulaire.emailOptionnel')}
            valeur={etat.email}
            onChange={(v) => set('email', v)}
            type="email"
            optionnel
            valide={emailOk}
          />

          {/* Vehicule + rattachement (livreur agence) */}
          {etat.role === 'LIVREUR_AGENCE' && (
            <>
              <SousTitre icone="ti-motorbike" texte={t('formulaire.vehicule')} />
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {t('formulaire.typeVehicule')} <span className="text-coli-orange">*</span>
                </label>
                <div className="relative">
                  <select
                    value={etat.typeVehicule}
                    onChange={(e) => set('typeVehicule', e.target.value)}
                    className="w-full px-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white appearance-none cursor-pointer"
                  >
                    <option value="">{t('commun.selectionner')}</option>
                    {VEHICULES.map((v) => (
                      <option key={v} value={v}>
                        {t(`vehicules.${v}`)}
                      </option>
                    ))}
                  </select>
                  <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {etat.typeVehicule === 'AUTRE' && (
                <ChampValide
                  label={t('formulaire.preciserType')}
                  valeur={etat.typeVehiculeAutre}
                  onChange={(v) => set('typeVehiculeAutre', v)}
                  valide={(v) => v.trim().length >= 2}
                  placeholder={t('formulaire.preciserPlaceholder')}
                />
              )}
              <ChampValide
                label={t('formulaire.plaque')}
                valeur={etat.plaque}
                onChange={(v) => set('plaque', v)}
                valide={(v) => v.trim().length >= 4}
                optionnel
                placeholder={t('formulaire.plaquePlaceholder')}
              />

              <SousTitre icone="ti-building-store" texte={t('formulaire.rattachement')} />
              <div className="mb-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  {t('formulaire.compagnie')} <span className="text-coli-orange">*</span>
                </label>
                <SelecteurCompagnie
                  compagnies={compagnies}
                  valeur={etat.compagnieId}
                  onChange={(id) => set('compagnieId', id)}
                />
                {compagnies.length === 0 && (
                  <p className="text-[11px] text-coli-orange mt-1">
                    {t('formulaire.aucuneCompagnie')}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Documents (livreur independant) */}
          {etat.role === 'LIVREUR_INDEPENDANT' && (
            <>
              <SousTitre icone="ti-files" texte={t('formulaire.documentsCoursier')} />
              <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center gap-3">
                <i className="ti ti-cloud-upload text-gray-400 text-xl" />
                <div className="text-xs text-gray-500">
                  {t('formulaire.docsApresCreation')}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pied */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100">
          {creation.isError && (
            <span className="text-xs text-red-600 mr-auto flex items-center gap-1">
              <i className="ti ti-alert-circle" />
              {t('commun.erreurCreation')}
            </span>
          )}
          <button
            onClick={onFermer}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
          >
            {t('commun.annuler')}
          </button>
          <button
            onClick={() => creation.mutate()}
            disabled={!peutCreer || creation.isPending}
            className="px-5 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
            style={{ boxShadow: OMBRE }}
          >
            {creation.isPending ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-check" />}
            {t('utilisateurs.creerUtilisateur')}
          </button>
        </div>
      </div>
    </div>
  );
}

function SousTitre({ icone, texte }: { icone: string; texte: string }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-3">
      <i className={`ti ${icone} text-coli-vert`} />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{texte}</span>
    </div>
  );
}