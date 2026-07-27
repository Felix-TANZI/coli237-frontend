import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { nombreEnAttente, synchroniser } from "../api/fileLocale";

// Gère la synchronisation des fiches locales et expose le compteur en attente.
export function useSynchro() {
  const qc = useQueryClient();
  const [enAttente, setEnAttente] = useState(nombreEnAttente());
  const [enCours, setEnCours] = useState(false);

  const rafraichirCompteur = useCallback(() => {
    setEnAttente(nombreEnAttente());
  }, []);

  const lancerSynchro = useCallback(async () => {
    if (nombreEnAttente() === 0 || !navigator.onLine) return;
    setEnCours(true);
    const res = await synchroniser();
    setEnAttente(res.restantes);
    setEnCours(false);
    if (res.envoyees > 0) {
      // Rafraichit les listes apres synchro reussie.
      void qc.invalidateQueries({ queryKey: ['mesRecensements'] });
      void qc.invalidateQueries({ queryKey: ['mesFiches'] });
      void qc.invalidateQueries({ queryKey: ['personnes'] });
    }
  }, [qc]);

  // Synchronise automatiquement quand le réseau revient.
  useEffect(() => {
    const auRetour = () => void lancerSynchro();
    window.addEventListener("online", auRetour);
    return () => window.removeEventListener("online", auRetour);
  }, [lancerSynchro]);

  // Tente une synchro au montage (si réseau + fiches en attente).
  useEffect(() => {
    const id = setTimeout(() => {
      void lancerSynchro();
    }, 0);
    return () => clearTimeout(id);
  }, [lancerSynchro]);

  return { enAttente, enCours, lancerSynchro, rafraichirCompteur };
}
