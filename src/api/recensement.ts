import { api } from "./client";

export interface NouveauCoursier {
  nom: string;
  telephone: string;
  cni?: string;
  ville?: string;
  quartier?: string;
  typeVehicule: string;
  plaque?: string;
  marqueModele?: string;
  aPermis: boolean;
  permisCategorie?: string;
  aCarteGrise: boolean;
  aAssurance: boolean;
  aCarteSmt: boolean;
  mobileMoneyNumero?: string;
  mobileMoneyOperateur?: string;
  latitude?: number;
  longitude?: number;
  partenaireId?: string;
}

export interface NouveauPartenaire {
  nom: string;
  sigle?: string;
  niu?: string;
  registreCommerce?: string;
  responsableNom: string;
  responsableTelephone: string;
  responsableEmail?: string;
  ville?: string;
  quartier?: string;
  adresse?: string;
  mobileMoneyNumero?: string;
  mobileMoneyOperateur?: string;
  latitude?: number;
  longitude?: number;
}

export async function creerCoursier(
  donnees: NouveauCoursier,
): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>("/coursiers", donnees);
  return data;
}

export async function creerPartenaire(
  donnees: NouveauPartenaire,
): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>("/partenaires", donnees);
  return data;
}
