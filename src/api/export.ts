import { api } from './client';

// Telecharge un fichier protege : axios envoie le jeton, puis on
// force le telechargement cote navigateur.
async function telecharger(url: string, nomFichier: string): Promise<void> {
  const reponse = await api.get(url, { responseType: 'blob' });
  const lien = document.createElement('a');
  const objet = URL.createObjectURL(reponse.data as Blob);
  lien.href = objet;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(objet);
}

// Export Excel des personnes, filtrable par role (optionnel).
export function exporterPersonnesExcel(role?: string): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const suffixe = role ? `-${role.toLowerCase()}` : '';
  const query = role ? `?role=${role}` : '';
  return telecharger(`/export/personnes.xlsx${query}`, `coli237-personnes${suffixe}-${date}.xlsx`);
}

// Export PDF des personnes, filtrable par role (optionnel).
export function exporterPersonnesPdf(role?: string): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const suffixe = role ? `-${role.toLowerCase()}` : '';
  const query = role ? `?role=${role}` : '';
  return telecharger(`/export/personnes.pdf${query}`, `coli237-personnes${suffixe}-${date}.pdf`);
}