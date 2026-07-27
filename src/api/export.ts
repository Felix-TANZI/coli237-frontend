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

export function exporterExcel(): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  return telecharger('/export/coursiers.xlsx', `coli237-coursiers-${date}.xlsx`);
}

export function exporterPdf(): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  return telecharger('/export/coursiers.pdf', `coli237-coursiers-${date}.pdf`);
}

export function exporterPartenairesExcel(): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  return telecharger('/export/partenaires.xlsx', `coli237-partenaires-${date}.xlsx`);
}

export function exporterPartenairesPdf(): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  return telecharger('/export/partenaires.pdf', `coli237-partenaires-${date}.pdf`);
}