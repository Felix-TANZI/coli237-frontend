import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  archiverCompagnie,
  creerCompagnie,
  listerCompagnies,
} from '../../api/compagnies';
import { listerPersonnes } from '../../api/personnes';
import { NavAgentBas, NavAgentHaut } from '../../composants/NavAgent';
import { agentConnecte } from '../../api/auth';

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

function couleurAvatar(nom: string): string {
  const c = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let s = 0;
  for (const ch of nom) s += ch.charCodeAt(0);
  return c[s % c.length];
}
function initiales(nom: string): string {
  return nom
    .split(' ')
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function CompagniesAgent() {
  const qc = useQueryClient();
  const moi = agentConnecte();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');

  const { data: compagnies = [], isLoading } = useQuery({
    queryKey: ['compagnies'],
    queryFn: listerCompagnies,
  });

  const archiver = useMutation({
    mutationFn: (id: string) => archiverCompagnie(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['compagnies'] }),
  });

  const filtrees = useMemo(() => {
    return compagnies.filter((c) =>
      recherche ? c.nom.toLowerCase().includes(recherche.toLowerCase()) : true,
    );
  }, [compagnies, recherche]);

  return (
    <div className="min-h-screen bg-coli-craie pb-24 md:pb-0">
      <NavAgentHaut nom={moi?.nom ?? 'Agent'} />

      <div className="max-w-4xl mx-auto px-4 py-5 md:px-6 md:py-6">
        {/* En-tete */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1
              className="font-extrabold text-xl md:text-2xl text-coli-encre tracking-tight"
              style={{ fontFamily: 'Sora, Inter' }}
            >
              Compagnies
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
              {compagnies.length} compagnie{compagnies.length > 1 ? 's' : ''} enregistree
              {compagnies.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-coli-orange text-white rounded-xl px-4 py-2.5 font-semibold text-sm flex items-center gap-2 hover:bg-orange-600 transition"
            style={{ boxShadow: '0 6px 16px rgba(242,140,40,.3)' }}
          >
            <i className="ti ti-plus" />
            <span className="hidden sm:inline">Nouvelle compagnie</span>
          </button>
        </div>

        {/* Recherche */}
        <div
          className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 mb-5"
          style={{ boxShadow: OMBRE }}
        >
          <i className="ti ti-search text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une compagnie..."
            className="outline-none text-sm flex-1 bg-transparent"
          />
        </div>

        {/* Liste */}
        {isLoading && <p className="text-sm text-gray-400 py-8 text-center">...</p>}
        {!isLoading && filtrees.length === 0 && (
          <div
            className="bg-white rounded-2xl border border-gray-200/70 p-8 text-center"
            style={{ boxShadow: OMBRE }}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <i className="ti ti-building-store text-2xl" />
            </div>
            <p className="text-sm text-gray-500">Aucune compagnie</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtrees.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-200/70 p-4"
              style={{ boxShadow: OMBRE }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold text-white shrink-0"
                  style={{ background: couleurAvatar(c.nom) }}
                >
                  {initiales(c.nom)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-coli-encre truncate">{c.nom}</div>
                  <div className="text-[11px] text-gray-400">
                    {c.admin ? `Admin : ${c.admin.prenom} ${c.admin.nom}` : 'Sans admin'}
                  </div>
                </div>
                <button
                  onClick={() => archiver.mutate(c.id)}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition shrink-0"
                  aria-label="Archiver"
                >
                  <i className="ti ti-trash" />
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                  style={
                    c.statut === 'ACTIVE'
                      ? { background: '#e8f8f3', color: '#0F6E56' }
                      : { background: '#f2f5f7', color: '#8a99a3' }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: c.statut === 'ACTIVE' ? '#1FB89E' : '#b0bcc4' }}
                  />
                  {c.statut === 'ACTIVE' ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[11px] text-gray-400">
                  {c._count?.personnes ?? 0} personne{(c._count?.personnes ?? 0) > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOuvert && <ModaleCompagnie onFermer={() => setModalOuvert(false)} />}

      <NavAgentBas />
    </div>
  );
}

// --- Modal creation ---
function ModaleCompagnie({ onFermer }: { onFermer: () => void }) {
  const qc = useQueryClient();
  const [nom, setNom] = useState('');
  const [adminId, setAdminId] = useState('');

  // Liste des admins compagnie deja recenses, pour le selecteur.
  const { data: personnes = [] } = useQuery({
    queryKey: ['personnes'],
    queryFn: () => listerPersonnes(),
  });
  const admins = personnes.filter((p) => p.role === 'ADMIN_COMPAGNIE');

  const creation = useMutation({
    mutationFn: () =>
      creerCompagnie({
        nom: nom.trim(),
        statut: 'ACTIVE',
        adminId: adminId || undefined,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['compagnies'] });
      onFermer();
    },
  });

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onFermer}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 20px 60px rgba(14,26,36,.25)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <div className="font-bold text-coli-encre">Nouvelle compagnie</div>
            <div className="text-xs text-gray-400">Renseignez les informations</div>
          </div>
          <button
            onClick={onFermer}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nom de la compagnie <span className="text-coli-orange">*</span>
            </label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex : SwiftLink Delivery"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Admin compagnie (optionnel)
            </label>
            <div className="relative">
              <select
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full px-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm bg-white appearance-none cursor-pointer"
              >
                <option value="">Aucun admin</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.prenom} {a.nom}
                  </option>
                ))}
              </select>
              <i className="ti ti-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {admins.length === 0 && (
              <p className="text-[11px] text-gray-400 mt-1">
                Aucun admin compagnie recense. Recensez-en un d'abord si besoin.
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2.5 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onFermer}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={() => creation.mutate()}
            disabled={creation.isPending || nom.trim().length < 2}
            className="flex-1 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
          >
            {creation.isPending ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-check" />}
            Creer
          </button>
        </div>
        {creation.isError && (
          <p className="text-xs text-red-600 px-5 pb-4 flex items-center gap-1">
            <i className="ti ti-alert-circle" />
            Erreur lors de la creation
          </p>
        )}
      </div>
    </div>
  );
}