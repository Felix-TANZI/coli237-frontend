import { api } from "./client";

export interface Partenaire {
  id: string;
  nom: string;
  sigle?: string | null;
  niu?: string | null;
  registreCommerce?: string | null;
  responsableNom: string;
  responsableTelephone: string;
  responsableEmail?: string | null;
  ville?: string | null;
  quartier?: string | null;
  adresse?: string | null;
  mobileMoneyNumero?: string | null;
  mobileMoneyOperateur?: string | null;
  statut: string;
  agentId: string;
  documents?: { id: string; type: string; chemin: string }[];
  coursiers?: { id: string }[];
  createdAt: string;
}

export async function listerPartenaires(): Promise<Partenaire[]> {
  const { data } = await api.get<Partenaire[]>("/partenaires");
  return data;
}

export async function validerPartenaire(id: string): Promise<void> {
  await api.post(`/partenaires/${id}/valider`);
}

export async function rejeterPartenaire(id: string): Promise<void> {
  await api.post(`/partenaires/${id}/rejeter`);
}
