import { api } from './client';

export interface Agent {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  role: 'AGENT' | 'ADMIN';
  statut: 'ACTIF' | 'SUSPENDU';
  doitChangerMotDePasse: boolean;
  createdAt: string;
}

export interface NouvelAgent {
  nom: string;
  telephone: string;
  email: string;
}

// La creation renvoie le mot de passe temporaire UNE seule fois.
export interface AgentCree {
  agent: Agent;
  motDePasseTemporaire: string;
}

export async function listerAgents(): Promise<Agent[]> {
  const { data } = await api.get<Agent[]>('/agents');
  return data;
}

export async function creerAgent(nouvel: NouvelAgent): Promise<AgentCree> {
  const { data } = await api.post<AgentCree>('/agents', nouvel);
  return data;
}

export async function reinitialiserMotDePasse(
  id: string,
): Promise<{ motDePasseTemporaire: string }> {
  const { data } = await api.post<{ motDePasseTemporaire: string }>(
    `/agents/${id}/reinitialiser-mot-de-passe`,
  );
  return data;
}

export async function modifierAgent(
  id: string,
  champs: Partial<Pick<Agent, 'nom' | 'telephone' | 'email' | 'statut'>>,
): Promise<Agent> {
  const { data } = await api.patch<Agent>(`/agents/${id}`, champs);
  return data;
}

export async function archiverAgent(id: string): Promise<void> {
  await api.delete(`/agents/${id}`);
}