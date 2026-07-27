import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { ajouterDocument, TYPES_DOCUMENT } from '../api/personnes';

interface DocExistant {
  id: string;
  type: string;
  chemin: string;
}

// Gere l'ajout de documents pour une personne (livreur independant surtout).
export function GestionDocuments({
  personneId,
  documents = [],
}: {
  personneId: string;
  documents?: DocExistant[];
}) {
  const qc = useQueryClient();
  const [type, setType] = useState('CNI');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: (fichier: File) => ajouterDocument(personneId, type, fichier),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['mesFiches'] });
      void qc.invalidateQueries({ queryKey: ['personnes'] });
    },
  });

  const choisirFichier = () => inputRef.current?.click();

  const surFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    if (fichier) upload.mutate(fichier);
    e.target.value = ''; // reset pour pouvoir renvoyer le meme fichier
  };

  const libelleType = (t: string) =>
    TYPES_DOCUMENT.find((d) => d.valeur === t)?.libelle ?? t;

  return (
    <div>
      {/* Documents deja presents */}
      {documents.length > 0 && (
        <div className="space-y-2 mb-3">
          {documents.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
            >
              <i className="ti ti-file-check text-coli-vert" />
              <span className="text-sm text-coli-encre flex-1">{libelleType(d.type)}</span>
              <i className="ti ti-circle-check text-coli-vert text-sm" />
            </div>
          ))}
        </div>
      )}

      {/* Ajout d'un nouveau document */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3.5 pr-9 py-2.5 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white appearance-none cursor-pointer"
          >
            {TYPES_DOCUMENT.map((d) => (
              <option key={d.valeur} value={d.valeur}>
                {d.libelle}
              </option>
            ))}
          </select>
          <i className="ti ti-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
        </div>
        <button
          onClick={choisirFichier}
          disabled={upload.isPending}
          className="px-4 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition shrink-0"
        >
          {upload.isPending ? (
            <i className="ti ti-loader-2 animate-spin" />
          ) : (
            <i className="ti ti-upload" />
          )}
          Ajouter
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={surFichier}
          className="hidden"
        />
      </div>

      {upload.isError && (
        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
          <i className="ti ti-alert-circle" />
          Echec de l'envoi. Formats : jpg, png, pdf. Max 5 Mo.
        </p>
      )}
      {upload.isSuccess && (
        <p className="text-xs text-coli-vert mt-2 flex items-center gap-1">
          <i className="ti ti-circle-check" />
          Document ajoute.
        </p>
      )}
    </div>
  );
}