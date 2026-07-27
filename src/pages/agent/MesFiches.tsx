import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { mesFiches, type MaFiche } from '../../api/espaceAgent';
import { modifierPersonne } from '../../api/personnes';
import { NavAgentBas, NavAgentHaut } from '../../composants/NavAgent';
import { agentConnecte } from '../../api/auth';
import { LISTE_ROLES, ROLES } from '../../composants/roles';
import { GestionDocuments } from '../../composants/GestionDocuments';

function couleurAvatar(nom: string): string {
  const c = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let s = 0;
  for (const ch of nom) s += ch.charCodeAt(0);
  return c[s % c.length];
}
function initiales(prenom: string, nom: string): string {
  return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase();
}
function formaterTel(tel: string): string {
  const n = tel.replace(/^\+237/, '').replace(/\s/g, '');
  if (n.length === 0) return tel;
  return `+237 ${n[0]} ${n.slice(1).replace(/(\d{2})(?=\d)/g, '$1 ')}`.trim();
}

const STATUT: Record<string, { bg: string; texte: string; label: string; icone: string }> = {
  VALIDE: { bg: '#e8f8f3', texte: '#0F6E56', label: 'Valide', icone: 'ti-circle-check' },
  EN_ATTENTE: { bg: '#fdf0e3', texte: '#985a12', label: 'En attente', icone: 'ti-clock' },
  REJETE: { bg: '#fdeaea', texte: '#a32d2d', label: 'Rejete', icone: 'ti-alert-triangle' },
};

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

export function MesFiches() {
  const moi = agentConnecte();
  const [filtreRole, setFiltreRole] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [recherche, setRecherche] = useState('');
  const [edition, setEdition] = useState<MaFiche | null>(null);

  const { data: fiches = [], isLoading } = useQuery({
    queryKey: ['mesFiches'],
    queryFn: mesFiches,
  });

  const filtrees = useMemo(() => {
    return fiches
      .filter((f) => (filtreRole ? f.role === filtreRole : true))
      .filter((f) => (filtreStatut ? f.statut === filtreStatut : true))
      .filter((f) =>
        recherche
          ? `${f.prenom} ${f.nom}`.toLowerCase().includes(recherche.toLowerCase()) ||
            f.telephone.includes(recherche)
          : true,
      );
  }, [fiches, filtreRole, filtreStatut, recherche]);

  const stats = useMemo(() => {
    return {
      total: fiches.length,
      attente: fiches.filter((f) => f.statut === 'EN_ATTENTE').length,
      valides: fiches.filter((f) => f.statut === 'VALIDE').length,
    };
  }, [fiches]);

  return (
    <div className="min-h-screen bg-coli-craie pb-24 md:pb-0">
      <NavAgentHaut nom={moi?.nom ?? 'Agent'} />

      <div className="max-w-6xl mx-auto px-4 py-5 md:px-6 md:py-6">
        {/* En-tete */}
        <div className="mb-4">
          <h1
            className="font-extrabold text-xl md:text-2xl text-coli-encre tracking-tight"
            style={{ fontFamily: 'Sora, Inter' }}
          >
            Mes fiches
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">
            {stats.total} recensement{stats.total > 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Bandeau de stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <MiniStat valeur={stats.total} label="Total" couleur="#17A2B8" icone="ti-clipboard-list" />
          <MiniStat valeur={stats.attente} label="En attente" couleur="#F28C28" icone="ti-clock" />
          <MiniStat valeur={stats.valides} label="Validees" couleur="#1FB89E" icone="ti-circle-check" />
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col md:flex-row md:items-center gap-2.5 mb-5">
          <div
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 flex-1"
            style={{ boxShadow: OMBRE }}
          >
            <i className="ti ti-search text-gray-400" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un nom, telephone..."
              className="outline-none text-sm flex-1 bg-transparent"
            />
          </div>

          {/* Filtre role */}
          <div className="relative md:w-52">
            <i className="ti ti-user-circle absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filtreRole}
              onChange={(e) => setFiltreRole(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-coli-encre outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 transition"
              style={{ boxShadow: OMBRE }}
            >
              <option value="">Tous les roles</option>
              {LISTE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLES[r].libelle}
                </option>
              ))}
            </select>
            <i className="ti ti-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
          </div>

          {/* Filtre statut */}
          <div className="relative md:w-44">
            <i className="ti ti-filter absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-coli-encre outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 transition"
              style={{ boxShadow: OMBRE }}
            >
              <option value="">Tous statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDE">Valide</option>
              <option value="REJETE">Rejete</option>
            </select>
            <i className="ti ti-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
          </div>
        </div>

        {/* Tableau desktop */}
        <div
          className="hidden md:block bg-white rounded-2xl border border-gray-200/70 overflow-hidden"
          style={{ boxShadow: OMBRE }}
        >
          <div className="grid grid-cols-[2fr_1.4fr_1.4fr_1fr_auto] gap-3 px-5 py-3 bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <div>Nom</div>
            <div>Telephone</div>
            <div>Role</div>
            <div>Statut</div>
            <div></div>
          </div>
          {isLoading && <div className="px-5 py-8 text-center text-gray-400 text-sm">···</div>}
          {!isLoading && filtrees.length === 0 && (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              Aucune fiche ne correspond
            </div>
          )}
          {filtrees.map((f) => {
            const s = STATUT[f.statut] ?? STATUT.EN_ATTENTE;
            const info = ROLES[f.role as keyof typeof ROLES];
            const modifiable = f.statut !== 'VALIDE';
            return (
              <div
                key={f.id}
                onClick={() => modifiable && setEdition(f)}
                className={`grid grid-cols-[2fr_1.4fr_1.4fr_1fr_auto] gap-3 px-5 py-3 border-b border-gray-50 last:border-none items-center transition ${
                  modifiable ? 'hover:bg-gray-50/60 cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0"
                    style={{ background: couleurAvatar(f.nom) }}
                  >
                    {initiales(f.prenom, f.nom)}
                  </div>
                  <div className="text-sm font-semibold text-coli-encre truncate">
                    {f.prenom} {f.nom}
                  </div>
                </div>
                <div className="text-sm text-gray-600">{formaterTel(f.telephone)}</div>
                <div>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: info?.fond, color: info?.couleur }}
                  >
                    {info?.libelle ?? f.type}
                  </span>
                </div>
                <div>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                    style={{ background: s.bg, color: s.texte }}
                  >
                    <i className={`ti ${s.icone} text-[11px]`} />
                    {s.label}
                  </span>
                </div>
                <div className="text-right">
                  {modifiable ? (
                    <span className="text-[11px] text-gray-400 inline-flex items-center gap-1">
                      <i className="ti ti-pencil" />
                      Modifier
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-300 inline-flex items-center gap-1">
                      <i className="ti ti-lock" />
                      Verrouillee
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cartes mobile */}
        <div className="md:hidden space-y-2.5">
          {isLoading && <p className="text-sm text-gray-400 py-8 text-center">···</p>}
          {!isLoading && filtrees.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">Aucune fiche ne correspond</p>
          )}
          {filtrees.map((f) => {
            const s = STATUT[f.statut] ?? STATUT.EN_ATTENTE;
            const info = ROLES[f.role as keyof typeof ROLES];
            const modifiable = f.statut !== 'VALIDE';
            return (
              <button
                key={f.id}
                onClick={() => modifiable && setEdition(f)}
                className="w-full bg-white rounded-2xl border border-gray-200/70 p-4 text-left"
                style={{ boxShadow: OMBRE }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white shrink-0"
                    style={{ background: couleurAvatar(f.nom) }}
                  >
                    {initiales(f.prenom, f.nom)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-coli-encre truncate">
                      {f.prenom} {f.nom}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">
                      {formaterTel(f.telephone)}
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0"
                    style={{ background: s.bg, color: s.texte }}
                  >
                    <i className={`ti ${s.icone} text-[11px]`} />
                    {s.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: info?.fond, color: info?.couleur }}
                  >
                    {info?.libelle ?? f.type}
                  </span>
                  {modifiable ? (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <i className="ti ti-pencil" />
                      Modifier
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-300 flex items-center gap-1">
                      <i className="ti ti-lock" />
                      Verrouillee
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal edition */}
      {edition && <ModaleEdition fiche={edition} onFermer={() => setEdition(null)} />}

      <NavAgentBas />
    </div>
  );
}

function MiniStat({
  valeur,
  label,
  couleur,
  icone,
}: {
  valeur: number;
  label: string;
  couleur: string;
  icone: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200/70 p-3.5 md:p-4" style={{ boxShadow: OMBRE }}>
      <div className="flex items-center gap-1.5 mb-1">
        <i className={`ti ${icone} text-sm`} style={{ color: couleur }} />
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <div
        className="font-extrabold text-2xl md:text-3xl"
        style={{ color: couleur, fontFamily: 'Sora, Inter' }}
      >
        {valeur}
      </div>
    </div>
  );
}

// --- Modal d'edition ---
function ModaleEdition({ fiche, onFermer }: { fiche: MaFiche; onFermer: () => void }) {
  const qc = useQueryClient();
  const [prenom, setPrenom] = useState(fiche.prenom);
  const [nom, setNom] = useState(fiche.nom);
  const [email, setEmail] = useState(fiche.email ?? '');
  const [telephone, setTelephone] = useState(fiche.telephone);
  const [plaque, setPlaque] = useState(fiche.plaque ?? '');

  const estLivreurAgence = fiche.role === 'LIVREUR_AGENCE';

  const maj = useMutation({
    mutationFn: () =>
      modifierPersonne(fiche.id, {
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.trim() || undefined,
        telephone: telephone.replace(/\s/g, ''),
        ...(estLivreurAgence && plaque.trim() ? { plaque: plaque.trim() } : {}),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['mesFiches'] });
      void qc.invalidateQueries({ queryKey: ['mesRecensements'] });
      onFermer();
    },
  });

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onFermer}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md my-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 20px 60px rgba(14,26,36,.25)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="font-bold text-coli-encre">Modifier la fiche</div>
          <button
            onClick={onFermer}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center"
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ChampMini label="Prenom" valeur={prenom} onChange={setPrenom} />
            <ChampMini label="Nom" valeur={nom} onChange={setNom} />
          </div>
          <ChampMini label="Telephone" valeur={telephone} onChange={setTelephone} />
          <ChampMini label="Email" valeur={email} onChange={setEmail} type="email" />
          {estLivreurAgence && <ChampMini label="Plaque" valeur={plaque} onChange={setPlaque} />}

          {fiche.role === 'LIVREUR_INDEPENDANT' && (
            <div className="pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                <i className="ti ti-files text-coli-vert" />
                Documents coursier
              </label>
              <GestionDocuments personneId={fiche.id} documents={fiche.documents} />
            </div>
          )}
        </div>
        <div className="flex gap-2.5 px-5 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={onFermer}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={() => maj.mutate()}
            disabled={maj.isPending || prenom.trim().length < 2 || nom.trim().length < 2}
            className="flex-1 py-2.5 rounded-xl bg-coli-vert text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-emerald-600 transition"
          >
            {maj.isPending ? <i className="ti ti-loader-2 animate-spin" /> : <i className="ti ti-check" />}
            Enregistrer
          </button>
        </div>
        {maj.isError && (
          <p className="text-xs text-red-600 px-5 pb-4 flex items-center gap-1">
            <i className="ti ti-alert-circle" />
            Modification impossible
          </p>
        )}
      </div>
    </div>
  );
}

function ChampMini({
  label,
  valeur,
  onChange,
  type = 'text',
}: {
  label: string;
  valeur: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        type={type}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 focus:border-coli-cyan outline-none text-sm"
      />
    </div>
  );
}