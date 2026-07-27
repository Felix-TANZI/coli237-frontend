import type { RolePersonne } from '../api/personnes';

interface InfoRole {
  libelle: string;
  couleur: string;
  fond: string;
  icone: string;
}

// Libelle, couleur et icone de chaque role.
export const ROLES: { [cle in RolePersonne]: InfoRole } = {
  LIVREUR_INDEPENDANT: {
    libelle: 'Livreur independant',
    couleur: '#0F6E56',
    fond: '#e8f8f3',
    icone: 'ti-motorbike',
  },
  LIVREUR_AGENCE: {
    libelle: 'Livreur agence',
    couleur: '#1c5a8a',
    fond: '#eaf3fb',
    icone: 'ti-truck-delivery',
  },
  ADMIN_COMPAGNIE: {
    libelle: 'Admin compagnie',
    couleur: '#5b4bb5',
    fond: '#f3f0fc',
    icone: 'ti-building-store',
  },
  MANAGER_AGENCE: {
    libelle: 'Manager agence',
    couleur: '#b23a52',
    fond: '#fdece8',
    icone: 'ti-user-cog',
  },
};

export const LISTE_ROLES: RolePersonne[] = [
  'LIVREUR_INDEPENDANT',
  'LIVREUR_AGENCE',
  'ADMIN_COMPAGNIE',
  'MANAGER_AGENCE',
];

// Un livreur a des champs vehicule.
export function estLivreur(role: RolePersonne): boolean {
  return role === 'LIVREUR_INDEPENDANT' || role === 'LIVREUR_AGENCE';
}