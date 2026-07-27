import { api } from './client';
import { ROLES } from '../composants/roles';
import type { Personne } from './personnes';

export interface StatsTableau {
  total: number;
  livreurs: number;
  attente: number;
  agentsActifs: number;
  parRegion: Record<string, number>;
  parRole: { type: string; nombre: number; pourcent: number }[];
  recents: {
    id: string;
    nom: string;
    type: string;
    lieu: string;
    statut: string;
    date: string;
  }[];
}

interface Agent {
  id: string;
  statut: string;
}

function libelleRole(role: string): string {
  return ROLES[role as keyof typeof ROLES]?.libelle ?? role;
}

export async function chargerTableau(): Promise<StatsTableau> {
  const [personnes, agents] = await Promise.all([
    api.get<Personne[]>('/personnes').then((r) => r.data),
    api.get<Agent[]>('/agents').then((r) => r.data),
  ]);

  const attente = personnes.filter((p) => p.statut === 'EN_ATTENTE').length;
  const livreurs = personnes.filter(
    (p) => p.role === 'LIVREUR_INDEPENDANT' || p.role === 'LIVREUR_AGENCE',
  ).length;

  // Repartition par ville.
  const parRegion: Record<string, number> = {};
  for (const p of personnes) {
    const v = p.ville ?? 'Inconnu';
    parRegion[v] = (parRegion[v] ?? 0) + 1;
  }

  // Repartition par role.
  const compteRole: Record<string, number> = {};
  for (const p of personnes) {
    compteRole[p.role] = (compteRole[p.role] ?? 0) + 1;
  }
  const total = personnes.length || 1;
  const parRole = Object.entries(compteRole)
    .map(([role, nombre]) => ({
      type: libelleRole(role),
      nombre,
      pourcent: Math.round((nombre / total) * 100),
    }))
    .sort((a, b) => b.nombre - a.nombre);

  const recents = personnes
    .map((p) => ({
      id: p.id,
      nom: `${p.prenom} ${p.nom}`,
      type: libelleRole(p.role),
      lieu: p.ville ?? '—',
      statut: p.statut,
      date: p.createdAt,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return {
    total: personnes.length,
    livreurs,
    attente,
    agentsActifs: agents.filter((a) => a.statut === 'ACTIF').length,
    parRegion,
    parRole,
    recents,
  };
}