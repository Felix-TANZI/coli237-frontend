import { api } from './client';
import { agentConnecte } from './auth';

// Objectif quotidien de recensements (ajustable plus tard cote admin).
export const OBJECTIF_JOUR = 10;

export interface MesStats {
  recenses: number;
  attente: number;
  valides: number;
  ceJour: number;
  rythme: { jour: string; nombre: number; estAujourdhui: boolean }[];
  recents: {
    id: string;
    nom: string;
    type: string;
    lieu: string;
    statut: string;
    date: string;
  }[];
}

interface Fiche {
  id: string;
  nom: string;
  ville?: string | null;
  statut: string;
  agentId: string;
  createdAt: string;
}
interface Coursier extends Fiche {
  typeVehicule: string;
}

function memeJour(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const LETTRES_JOUR = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export async function mesRecensements(): Promise<MesStats> {
  const moi = agentConnecte();
  const monId = moi?.id;

  const [coursiers, partenaires] = await Promise.all([
    api.get<Coursier[]>('/coursiers').then((r) => r.data),
    api.get<Fiche[]>('/partenaires').then((r) => r.data),
  ]);

  const mesCoursiers = coursiers.filter((c) => c.agentId === monId);
  const mesPartenaires = partenaires.filter((p) => p.agentId === monId);
  const tout = [...mesCoursiers, ...mesPartenaires];

  const now = new Date();
  const attente = tout.filter((x) => x.statut === 'EN_ATTENTE').length;
  const valides = tout.filter((x) => x.statut === 'VALIDE').length;
  const ceJour = tout.filter((x) => memeJour(new Date(x.createdAt), now)).length;

  // Rythme des 7 derniers jours.
  const rythme = [];
  for (let i = 6; i >= 0; i--) {
    const jour = new Date(now);
    jour.setDate(now.getDate() - i);
    const nombre = tout.filter((x) => memeJour(new Date(x.createdAt), jour)).length;
    rythme.push({
      jour: LETTRES_JOUR[jour.getDay()],
      nombre,
      estAujourdhui: i === 0,
    });
  }

  const recents = [
    ...mesCoursiers.map((c) => ({
      id: c.id,
      nom: c.nom,
      type: c.typeVehicule,
      lieu: c.ville ?? '—',
      statut: c.statut,
      date: c.createdAt,
    })),
    ...mesPartenaires.map((p) => ({
      id: p.id,
      nom: p.nom,
      type: 'Partenaire',
      lieu: p.ville ?? '—',
      statut: p.statut,
      date: p.createdAt,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return { recenses: tout.length, attente, valides, ceJour, rythme, recents };
}

export interface MaFiche {
  id: string;
  nom: string;
  type: string;
  categorie: 'coursier' | 'partenaire';
  lieu: string;
  statut: string;
  date: string;
}

// Liste complète des fiches créées par l'agent (pour la page "Mes fiches").
export async function mesFiches(): Promise<MaFiche[]> {
  const moi = agentConnecte();
  const monId = moi?.id;

  const [coursiers, partenaires] = await Promise.all([
    api.get<Coursier[]>('/coursiers').then((r) => r.data),
    api.get<Fiche[]>('/partenaires').then((r) => r.data),
  ]);

  const mesCoursiers = coursiers
    .filter((c) => c.agentId === monId)
    .map((c) => ({
      id: c.id,
      nom: c.nom,
      type: c.typeVehicule,
      categorie: 'coursier' as const,
      lieu: c.ville ?? '—',
      statut: c.statut,
      date: c.createdAt,
    }));

  const mesPartenaires = partenaires
    .filter((p) => p.agentId === monId)
    .map((p) => ({
      id: p.id,
      nom: p.nom,
      type: 'Partenaire',
      categorie: 'partenaire' as const,
      lieu: p.ville ?? '—',
      statut: p.statut,
      date: p.createdAt,
    }));

  return [...mesCoursiers, ...mesPartenaires].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}