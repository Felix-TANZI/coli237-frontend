// File d'attente locale pour le mode hors-ligne.
// Les fiches créées sans réseau sont stockées ici, puis synchronisées.

import { creerCoursier, creerPartenaire } from './recensement';
import type { NouveauCoursier, NouveauPartenaire } from './recensement';

const CLE_STOCKAGE = 'coli_file_locale';

export interface FicheLocale {
  idLocal: string;
  categorie: 'coursier' | 'partenaire';
  donnees: NouveauCoursier | NouveauPartenaire;
  creeeLe: string;
  // Pour l'affichage dans la liste "Mes fiches"
  apercu: { nom: string; type: string; lieu: string };
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

// Écrit la file dans le stockage.
function ecrireFile(file: FicheLocale[]): void {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(file));
}

// Ajoute une fiche à la file locale.
export function ajouterEnLocal(fiche: Omit<FicheLocale, 'idLocal' | 'creeeLe'>): void {
  const file = lireFile();
  file.push({
    ...fiche,
    idLocal: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    creeeLe: new Date().toISOString(),
  });
  ecrireFile(file);
}

// Retire une fiche de la file (après synchronisation réussie).
function retirer(idLocal: string): void {
  ecrireFile(lireFile().filter((f) => f.idLocal !== idLocal));
}

// Nombre de fiches en attente de synchronisation.
export function nombreEnAttente(): number {
  return lireFile().length;
}

// Tente de synchroniser toute la file. Renvoie le nombre de fiches envoyées.
export async function synchroniser(): Promise<{ envoyees: number; restantes: number }> {
  const file = lireFile();
  let envoyees = 0;

  for (const fiche of file) {
    try {
      if (fiche.categorie === 'coursier') {
        await creerCoursier(fiche.donnees as NouveauCoursier);
      } else {
        await creerPartenaire(fiche.donnees as NouveauPartenaire);
      }
      retirer(fiche.idLocal);
      envoyees++;
    } catch {
      // On s'arrête à la première erreur (réseau coupé à nouveau) :
      // les fiches restantes seront réessayées plus tard.
      break;
    }
  }

  return { envoyees, restantes: nombreEnAttente() };
}