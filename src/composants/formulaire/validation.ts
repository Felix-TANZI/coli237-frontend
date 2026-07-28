// Regles de validation alignees sur le backend (schema Zod).

// Nettoie un numero : retire espaces, tirets, points, parentheses.
export function nettoyerNumero(brut: string): string {
  return brut.replace(/[\s.\-()]/g, '');
}

// Longueur max d'un numero (hors indicatif) : 9 chiffres au Cameroun,
// on laisse un peu de marge pour l'international.
export const MAX_CHIFFRES_TEL = 12;

// Telephone : format international souple.
// Telephone : indicatif + numero national. Valide si 8 a 15 chiffres au total.
export function telephoneValide(brut: string): boolean {
  const n = nettoyerNumero(brut);
  return /^\+?\d{8,15}$/.test(n);
}

// Mobile money : vide, ou 8 a 15 chiffres.
export function mobileMoneyValide(brut: string): boolean {
  const n = nettoyerNumero(brut);
  return n === '' || /^\+?\d{8,15}$/.test(n);
}

// Detecte l'operateur d'apres le prefixe (normes MTN / Orange Cameroun).
// MTN : 650-654, 67, 680-684. Orange : 655-659, 69, 685-689.
export function detecterOperateur(brut: string): 'MTN' | 'ORANGE' | null {
  const n = nettoyerNumero(brut).replace(/^\+237/, '');
  if (n.length < 3) return null;
  const p2 = n.slice(0, 2);
  const p3 = n.slice(0, 3);

  if (p2 === '67') return 'MTN';
  if (p2 === '69') return 'ORANGE';
  if (p2 === '65') {
    const d = Number(n[2]);
    return d <= 4 ? 'MTN' : 'ORANGE';
  }
  if (p2 === '68') {
    const d = Number(n[2]);
    return d <= 4 ? 'MTN' : 'ORANGE';
  }
  if (['650', '651', '652', '653', '654'].includes(p3)) return 'MTN';
  if (['655', '656', '657', '658', '659'].includes(p3)) return 'ORANGE';
  return null;
}

// CNI camerounaise : chiffres, longueur raisonnable (jusqu'a 20).
export function cniValide(brut: string): boolean {
  const n = brut.trim();
  return n === '' || (n.length >= 6 && n.length <= 20);
}

// Nom : au moins 2 caracteres.
export function nomValide(brut: string): boolean {
  return brut.trim().length >= 2;
}