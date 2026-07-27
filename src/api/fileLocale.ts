// File d'attente locale pour le mode hors-ligne.
// Les fiches creees sans reseau sont stockees ici, puis synchronisees.

import { creerPersonne, type NouvellePersonne } from './personnes';

const CLE_STOCKAGE = 'coli_file_locale';

export interface FicheLocale {
  idLocal: string;
  donnees: NouvellePersonne;
  creeeLe: string;
  // Pour l'affichage dans la liste "Mes fiches"
  apercu: { nom: string; role: string; lieu: string };
}

// Lit la file depuis le stockage.
export function lireFile(): FicheLocale[] {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    return brut ? (JSON.parse(brut) as FicheLocale[]) : [];
  } catch {
    return [];
  }
}

// Ecrit la file dans le stockage.
function ecrireFile(file: FicheLocale[]): void {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(file));
}

// Ajoute une fiche a la file locale.
export function ajouterEnLocal(fiche: Omit<FicheLocale, 'idLocal' | 'creeeLe'>): void {
  const file = lireFile();
  file.push({
    ...fiche,
    idLocal: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    creeeLe: new Date().toISOString(),
  });
  ecrireFile(file);
}

// Retire une fiche de la file (apres synchronisation reussie).
function retirer(idLocal: string): void {
  ecrireFile(lireFile().filter((f) => f.idLocal !== idLocal));
}

// Nombre de fiches en attente de synchronisation.
export function nombreEnAttente(): number {
  return lireFile().length;
}

// Tente de synchroniser toute la file. Renvoie le nombre de fiches envoyees.
export async function synchroniser(): Promise<{ envoyees: number; restantes: number }> {
  const file = lireFile();
  let envoyees = 0;

  for (const fiche of file) {
    try {
      await creerPersonne(fiche.donnees);
      retirer(fiche.idLocal);
      envoyees++;
    } catch {
      // On s'arrete a la premiere erreur (reseau coupe a nouveau) :
      // les fiches restantes seront reessayees plus tard.
      break;
    }
  }

  return { envoyees, restantes: nombreEnAttente() };
}