import { useEffect, useState } from 'react';

// Cercle de progression : fait / objectif.
export function AnneauObjectif({ fait, objectif }: { fait: number; objectif: number }) {
  const rayon = 32;
  const circonference = 2 * Math.PI * rayon;
  const ratio = Math.min(fait / objectif, 1);

  // Animation du remplissage.
  const [progres, setProgres] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgres(ratio));
    return () => cancelAnimationFrame(id);
  }, [ratio]);

  const offset = circonference * (1 - progres);

  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0">
      <circle cx="38" cy="38" r={rayon} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="7" />
      <circle
        cx="38"
        cy="38"
        r={rayon}
        fill="none"
        stroke="#1FB89E"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circonference}
        strokeDashoffset={offset}
        transform="rotate(-90 38 38)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="38" y="35" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="800" fontFamily="Sora">
        {fait}
      </text>
      <text x="38" y="49" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="9" fontFamily="Inter">
        / {objectif}
      </text>
    </svg>
  );
}