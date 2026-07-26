import { api } from './client';

export interface StatsTableau {
  coursiers: number;
  partenaires: number;
  attente: number;
  agentsActifs: number;
  parRegion: Record<string, number>;
  parVehicule: { type: string; nombre: number; pourcent: number }[];
  recents: {
    id: string;
    nom: string;
    type: string;
    lieu: string;
    statut: string;
  }[];
}

interface Coursier {
  id: string;
  nom: string;
  ville?: string | null;
  typeVehicule: string;
  statut: string;
  createdAt: string;
}
interface Partenaire {
  id: string;
  nom: string;
  ville?: string | null;
  statut: string;
  createdAt: string;
}
interface Agent {
  id: string;
  statut: string;
}

// Libelles lisibles pour les types de vehicule.
const LIBELLE_VEHICULE: Record<string, string> = {
  MOTO: 'Moto',
  TRICYCLE: 'Tricycle',
  VOITURE: 'Voiture',
  CAMIONNETTE: 'Camionnette',
  A_PIED: 'À pied',
  AUTRE: 'Autre',
};

export async function chargerTableau(): Promise<StatsTableau> {
  const [coursiers, partenaires, agents] = await Promise.all([
    api.get<Coursier[]>('/coursiers').then((r) => r.data),
    api.get<Partenaire[]>('/partenaires').then((r) => r.data),
    api.get<Agent[]>('/agents').then((r) => r.data),
  ]);

  const attente =
    coursiers.filter((c) => c.statut === 'EN_ATTENTE').length +
    partenaires.filter((p) => p.statut === 'EN_ATTENTE').length;

  const parRegion: Record<string, number> = {};
  for (const c of coursiers) {
    const v = c.ville ?? 'Inconnu';
    parRegion[v] = (parRegion[v] ?? 0) + 1;
  }

  // Repartition par type de vehicule
  const compteVehicule: Record<string, number> = {};
  for (const c of coursiers) {
    compteVehicule[c.typeVehicule] = (compteVehicule[c.typeVehicule] ?? 0) + 1;
  }
  const total = coursiers.length || 1;
  const parVehicule = Object.entries(compteVehicule)
    .map(([type, nombre]) => ({
      type: LIBELLE_VEHICULE[type] ?? type,
      nombre,
      pourcent: Math.round((nombre / total) * 100),
    }))
    .sort((a, b) => b.nombre - a.nombre);

  const recents = [
    ...coursiers.map((c) => ({
      id: c.id,
      nom: c.nom,
      type: LIBELLE_VEHICULE[c.typeVehicule] ?? c.typeVehicule,
      lieu: c.ville ?? '—',
      statut: c.statut,
      date: c.createdAt,
    })),
    ...partenaires.map((p) => ({
      id: p.id,
      nom: p.nom,
      type: 'Partenaire',
      lieu: p.ville ?? '—',
      statut: p.statut,
      date: p.createdAt,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return {
    coursiers: coursiers.length,
    partenaires: partenaires.length,
    attente,
    agentsActifs: agents.filter((a) => a.statut === 'ACTIF').length,
    parRegion,
    parVehicule,
    recents,
  };
}