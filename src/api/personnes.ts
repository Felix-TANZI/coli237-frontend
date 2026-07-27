import { api } from "./client";

export type RolePersonne =
  | "ADMIN_COMPAGNIE"
  | "MANAGER_AGENCE"
  | "LIVREUR_INDEPENDANT"
  | "LIVREUR_AGENCE";

export interface Personne {
  id: string;
  role: RolePersonne;
  statut: string;
  prenom: string;
  nom: string;
  email?: string | null;
  telephone: string;
  avatarUrl?: string | null;
  ville?: string | null;
  quartier?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  typeVehicule?: string | null;
  typeVehiculeAutre?: string | null;
  plaque?: string | null;
  compagnieId?: string | null;
  statutChauffeur?: string | null;
  mobileMoneyNumero?: string | null;
  mobileMoneyOperateur?: string | null;
  agent?: { id: string; nom: string };
  compagnie?: { id: string; nom: string } | null;
  documents?: { id: string; type: string; chemin: string }[];
  createdAt: string;
}

export interface NouvellePersonne {
  role: RolePersonne;
  prenom: string;
  nom: string;
  email?: string;
  telephone: string;
  ville?: string;
  quartier?: string;
  latitude?: number;
  longitude?: number;
  typeVehicule?: string;
  typeVehiculeAutre?: string;
  plaque?: string;
  compagnieId?: string;
  statutChauffeur?: string;
  mobileMoneyNumero?: string;
  mobileMoneyOperateur?: string;
}

export interface FiltresPersonnes {
  role?: string;
  statut?: string;
  ville?: string;
  recherche?: string;
}

// Liste avec filtres optionnels (passés en query params).
export async function listerPersonnes(
  filtres: FiltresPersonnes = {},
): Promise<Personne[]> {
  const { data } = await api.get<Personne[]>("/personnes", { params: filtres });
  return data;
}

export async function trouverPersonne(id: string): Promise<Personne> {
  const { data } = await api.get<Personne>(`/personnes/${id}`);
  return data;
}

export async function creerPersonne(
  donnees: NouvellePersonne,
): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>("/personnes", donnees);
  return data;
}

export async function validerPersonne(id: string): Promise<void> {
  await api.post(`/personnes/${id}/valider`);
}

export async function rejeterPersonne(id: string): Promise<void> {
  await api.post(`/personnes/${id}/rejeter`);
}

export async function archiverPersonne(id: string): Promise<void> {
  await api.delete(`/personnes/${id}`);
}

// Modifie une personne (agent : ses propres fiches non validees).
export async function modifierPersonne(
  id: string,
  donnees: Partial<NouvellePersonne>,
): Promise<Personne> {
  const { data } = await api.patch<Personne>(`/personnes/${id}`, donnees);
  return data;
}
