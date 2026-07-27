import { useEffect, useRef, useState } from "react";

// Anime un nombre de 0 jusqu'a sa valeur.
export function CompteurAnime({ valeur }: { valeur: number }) {
  const [affiche, setAffiche] = useState(0);
  const refDebut = useRef<number | null>(null);

  useEffect(() => {
    const duree = 800;
    let frame: number;

    const etape = (t: number) => {
      if (refDebut.current === null) refDebut.current = t;
      const progres = Math.min((t - refDebut.current) / duree, 1);
      // Courbe douce (ease-out)
      const eased = 1 - Math.pow(1 - progres, 3);
      setAffiche(Math.round(eased * valeur));
      if (progres < 1) frame = requestAnimationFrame(etape);
    };

    frame = requestAnimationFrame(etape);
    return () => cancelAnimationFrame(frame);
  }, [valeur]);

  return <>{affiche}</>;
}
