import { useEffect, useState } from 'react';

// Suit l'etat de connexion reseau du navigateur.
export function useEnLigne(): boolean {
  const [enLigne, setEnLigne] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const activer = () => setEnLigne(true);
    const desactiver = () => setEnLigne(false);
    window.addEventListener('online', activer);
    window.addEventListener('offline', desactiver);
    return () => {
      window.removeEventListener('online', activer);
      window.removeEventListener('offline', desactiver);
    };
  }, []);

  return enLigne;
}