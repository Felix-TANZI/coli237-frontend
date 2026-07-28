import { api } from './client';
import { ROLES } from '../composants/roles';
import type { Personne } from './personnes';

export interface StatsTableau {
  total: number;
  livreurs: number;
  attente: number;
  valides: number;
  rejetes: number;
  agentsActifs: number;
  parRegion: Record<string, number>;
  parRole: { type: string; nombre: number; pourcent: number }[];
  classementAgents: { id: string; nom: string; nombre: number }[];
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
  nom: string;
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
  const valides = personnes.filter((p) => p.statut === 'VALIDE').length;
  const rejetes = personnes.filter((p) => p.statut === 'REJETE').length;
  const livreurs = personnes.filter(
    (p) => p.role === 'LIVREUR_INDEPENDANT' || p.role === 'LIVREUR_AGENCE',
  ).length;

  // Repartition par ville (conserve pour compatibilite).
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

  // Classement des agents par nombre de recensements.
  // On croise avec la liste des agents pour avoir les noms de facon fiable.
  const nomParAgent: Record<string, string> = {};
  for (const a of agents) nomParAgent[a.id] = a.nom;

  const compteAgent: Record<string, number> = {};
  for (const p of personnes) {
    const idAgent = p.agent?.id;
    if (!idAgent) continue;
    compteAgent[idAgent] = (compteAgent[idAgent] ?? 0) + 1;
  }
  const classementAgents = Object.entries(compteAgent)
    .map(([id, nombre]) => ({
      id,
      nom: nomParAgent[id] ?? p_agent_nom(personnes, id) ?? 'Agent',
      nombre,
    }))
    .sort((a, b) => b.nombre - a.nombre)
    .slice(0, 5);

  const recents = personnes
    .map((p) => ({
      id: p.id,
      nom: `${p.prenom} ${p.nom}`,
      type: libelleRole(p.role),
      lieu: p.ville ?? '-',
      statut: p.statut,
      date: p.createdAt,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return {
    total: personnes.length,
    livreurs,
    attente,
    valides,
    rejetes,
    agentsActifs: agents.filter((a) => a.statut === 'ACTIF').length,
    parRegion,
    parRole,
    classementAgents,
    recents,
  };
}

// Repli : recupere le nom de l'agent depuis les personnes, si l'agent
// n'etait pas dans la liste /agents (ex : agent archive).
function p_agent_nom(personnes: Personne[], idAgent: string): string | undefined {
  const p = personnes.find((x) => x.agent?.id === idAgent);
  return p?.agent?.nom;
}