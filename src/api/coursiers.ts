import { api } from './client';

export interface Coursier {
  id: string;
  nom: string;
  telephone: string;
  cni?: string | null;
  ville?: string | null;
  quartier?: string | null;
  typeVehicule: string;
  plaque?: string | null;
  marqueModele?: string | null;
  aPermis: boolean;
  permisCategorie?: string | null;
  aCarteGrise: boolean;
  aAssurance: boolean;
  aCarteSmt: boolean;
  mobileMoneyNumero?: string | null;
  mobileMoneyOperateur?: string | null;
  statut: string;
  agentId: string;
  documents?: { id: string; type: string; chemin: string }[];
  createdAt: string;
}

export async function listerCoursiers(): Promise<Coursier[]> {
  const { data } = await api.get<Coursier[]>('/coursiers');
  return data;
}

export async function validerCoursier(id: string): Promise<void> {
  await api.post(`/coursiers/${id}/valider`);
}

export async function rejeterCoursier(id: string): Promise<void> {
  await api.post(`/coursiers/${id}/rejeter`);
}