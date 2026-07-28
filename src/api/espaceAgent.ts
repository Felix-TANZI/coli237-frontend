import { api } from './client';
import { agentConnecte } from './auth';
import { ROLES } from '../composants/roles';
import type { Personne } from './personnes';

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

function memeJour(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const LETTRES_JOUR = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// Libelle court du role, pour l'affichage.
function libelleRole(role: string): string {
  return ROLES[role as keyof typeof ROLES]?.libelle ?? role;
}

export async function mesRecensements(): Promise<MesStats> {
  const moi = agentConnecte();
  const monId = moi?.id;

  const personnes = await api.get<Personne[]>('/personnes').then((r) => r.data);
  const miennes = personnes.filter((p) => p.agent?.id === monId);

  const now = new Date();
  const attente = miennes.filter((x) => x.statut === 'EN_ATTENTE').length;
  const valides = miennes.filter((x) => x.statut === 'VALIDE').length;
  const ceJour = miennes.filter((x) => memeJour(new Date(x.createdAt), now)).length;

  // Rythme des 7 derniers jours.
  const rythme = [];
  for (let i = 6; i >= 0; i--) {
    const jour = new Date(now);
    jour.setDate(now.getDate() - i);
    const nombre = miennes.filter((x) => memeJour(new Date(x.createdAt), jour)).length;
    rythme.push({
      jour: LETTRES_JOUR[jour.getDay()],
      nombre,
      estAujourdhui: i === 0,
    });
  }

  const recents = miennes
    .map((p) => ({
      id: p.id,
      nom: `${p.prenom} ${p.nom}`,
      type: libelleRole(p.role),
      lieu: p.ville ?? '—',
      statut: p.statut,
      date: p.createdAt,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return { recenses: miennes.length, attente, valides, ceJour, rythme, recents };
}

export interface MaFiche {
  id: string;
  prenom: string;
  nom: string;
  role: string;
  type: string;
  email?: string | null;
  telephone: string;
  typeVehicule?: string | null;
  typeVehiculeAutre?: string | null;
  plaque?: string | null;
  compagnie?: { id: string; nom: string } | null;
  documents?: { id: string; type: string; chemin: string }[];
  lieu: string;
  statut: string;
  date: string;
}

// Liste complete des fiches creees par l'agent (pour la page "Mes fiches").
export async function mesFiches(): Promise<MaFiche[]> {
  const moi = agentConnecte();
  const monId = moi?.id;

  const personnes = await api.get<Personne[]>('/personnes').then((r) => r.data);

  return personnes
    .filter((p) => p.agent?.id === monId)
    .map((p) => ({
      id: p.id,
      prenom: p.prenom,
      nom: p.nom,
      role: p.role,
      type: libelleRole(p.role),
      email: p.email,
      telephone: p.telephone,
      typeVehicule: p.typeVehicule,
      typeVehiculeAutre: p.typeVehiculeAutre,
      plaque: p.plaque,
      compagnie: p.compagnie,
      documents: p.documents,
      lieu: p.ville ?? '—',
      statut: p.statut,
      date: p.createdAt,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}