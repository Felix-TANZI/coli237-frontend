import { api } from './client';

export interface Compagnie {
  id: string;
  nom: string;
  statut: string;
  adminId?: string | null;
  admin?: { id: string; prenom: string; nom: string } | null;
  agent?: { id: string; nom: string } | null;
  _count?: { personnes: number };
  createdAt: string;
}

export async function listerCompagnies(): Promise<Compagnie[]> {
  const { data } = await api.get<Compagnie[]>('/compagnies');
  return data;
}

export async function creerCompagnie(donnees: {
  nom: string;
  statut?: string;
  adminId?: string;
}): Promise<Compagnie> {
  const { data } = await api.post<Compagnie>('/compagnies', donnees);
  return data;
}

export async function modifierCompagnie(
  id: string,
  donnees: { nom?: string; statut?: string; adminId?: string },
): Promise<Compagnie> {
  const { data } = await api.patch<Compagnie>(`/compagnies/${id}`, donnees);
  return data;
}

export async function archiverCompagnie(id: string): Promise<void> {
  await api.delete(`/compagnies/${id}`);
}