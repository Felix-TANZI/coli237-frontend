import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  archiverAgent,
  creerAgent,
  listerAgents,
  modifierAgent,
  reinitialiserMotDePasse,
  type Agent,
} from '../api/agents';
import { BarreNav, BarreNavMobile } from '../composants/BarreNav';
import { ModaleCreerAgent, ModaleMotDePasse } from '../composants/ModaleAgent';

function couleurAvatar(nom: string): string {
  const c = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let s = 0;
  for (const ch of nom) s += ch.charCodeAt(0);
  return c[s % c.length];
}
function initiales(nom: string): string {
  return nom.split(' ').map((m) => m[0]).slice(0, 2).join('').toUpperCase();
}

export function Agents() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [recherche, setRecherche] = useState('');
  const [creation, setCreation] = useState(false);
  const [mdpAffiche, setMdpAffiche] = useState<{ mdp: string; reinit: boolean } | null>(null);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: listerAgents,
  });

  const rafraichir = () => void qc.invalidateQueries({ queryKey: ['agents'] });

  const creer = useMutation({
    mutationFn: creerAgent,
    onSuccess: (res) => {
      rafraichir();
      setCreation(false);
      setMdpAffiche({ mdp: res.motDePasseTemporaire, reinit: false });
    },
  });

  const reinit = useMutation({
    mutationFn: reinitialiserMotDePasse,
    onSuccess: (res) => {
      setMdpAffiche({ mdp: res.motDePasseTemporaire, reinit: true });
    },
  });

  const basculerStatut = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: 'ACTIF' | 'SUSPENDU' }) =>
      modifierAgent(id, { statut }),
    onSuccess: rafraichir,
  });

  const archiver = useMutation({
    mutationFn: archiverAgent,
    onSuccess: rafraichir,
  });

  const actifs = agents.filter((a) => a.statut === 'ACTIF').length;

  const filtres = useMemo(
    () =>
      agents.filter((a) =>
        recherche
          ? a.nom.toLowerCase().includes(recherche.toLowerCase()) ||
            a.email.toLowerCase().includes(recherche.toLowerCase())
          : true,
      ),
    [agents, recherche],
  );

  return (
    <div className="min-h-screen bg-coli-craie pb-20 md:pb-0">
      <BarreNav />

      <main className="px-4 sm:px-6 py-5 sm:py-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="font-extrabold text-xl sm:text-2xl text-coli-encre tracking-tight" style={{ fontFamily: 'Sora, Inter' }}>
              {t('agents.titre')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {t('agents.sousTitre', { total: agents.length, actifs })}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <i className="ti ti-search text-gray-400 text-base" />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder={t('agents.rechercher')}
                className="outline-none text-sm bg-transparent w-32 sm:w-44"
              />
            </div>
            <button onClick={() => setCreation(true)} className="bg-coli-orange text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold flex items-center gap-1.5 hover:bg-coli-orange-fonce transition shrink-0">
              <i className="ti ti-plus" />
              <span className="hidden sm:inline">{t('agents.nouveau')}</span>
            </button>
          </div>
        </div>

        {/* Tableau (desktop) */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr] px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <span>{t('agents.colAgent')}</span>
            <span>{t('agents.colContact')}</span>
            <span>{t('agents.colRole')}</span>
            <span>{t('agents.colStatut')}</span>
            <span className="text-right">{t('agents.colActions')}</span>
          </div>

          {isLoading && <p className="text-sm text-gray-400 py-8 text-center">···</p>}
          {!isLoading && filtres.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">{t('agents.aucun')}</p>
          )}

          {filtres.map((a) => (
            <LigneAgent
              key={a.id}
              agent={a}
              onReinit={() => reinit.mutate(a.id)}
              onBasculer={() =>
                basculerStatut.mutate({
                  id: a.id,
                  statut: a.statut === 'ACTIF' ? 'SUSPENDU' : 'ACTIF',
                })
              }
              onArchiver={() => archiver.mutate(a.id)}
            />
          ))}
        </div>

        {/* Cartes (mobile) */}
        <div className="md:hidden space-y-2.5">
          {filtres.map((a) => (
            <CarteAgent
              key={a.id}
              agent={a}
              onReinit={() => reinit.mutate(a.id)}
              onBasculer={() =>
                basculerStatut.mutate({
                  id: a.id,
                  statut: a.statut === 'ACTIF' ? 'SUSPENDU' : 'ACTIF',
                })
              }
              onArchiver={() => archiver.mutate(a.id)}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          {filtres.length} {t('agents.sur')} {agents.length}
        </p>
      </main>

      <BarreNavMobile />

      {creation && (
        <ModaleCreerAgent
          onFermer={() => setCreation(false)}
          onCreer={(v) => creer.mutate(v)}
          enCours={creer.isPending}
        />
      )}
      {mdpAffiche && (
        <ModaleMotDePasse
          motDePasse={mdpAffiche.mdp}
          reinit={mdpAffiche.reinit}
          onFermer={() => setMdpAffiche(null)}
        />
      )}
    </div>
  );
}

const STATUT: Record<string, { bg: string; texte: string; cle: string }> = {
  ACTIF: { bg: '#e8f8f3', texte: '#0F6E56', cle: 'actif' },
  SUSPENDU: { bg: '#fdeaea', texte: '#a32d2d', cle: 'suspendu' },
};

function LigneAgent({
  agent,
  onReinit,
  onBasculer,
  onArchiver,
}: {
  agent: Agent;
  onReinit: () => void;
  onBasculer: () => void;
  onArchiver: () => void;
}) {
  const { t } = useTranslation();
  const s = STATUT[agent.statut] ?? STATUT.ACTIF;
  const estActif = agent.statut === 'ACTIF';

  return (
    <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr] px-5 py-3 items-center border-b border-gray-50 last:border-none hover:bg-gray-50/50 transition">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: couleurAvatar(agent.nom) }}>
          {initiales(agent.nom)}
        </div>
        <div className="text-sm font-medium text-coli-encre truncate">{agent.nom}</div>
      </div>
      <div className="min-w-0">
        <div className="text-sm text-gray-600 truncate">{agent.email}</div>
        <div className="text-xs text-gray-400">{agent.telephone}</div>
      </div>
      <span className="text-xs text-gray-500">{t(`agents.role_${agent.role}`)}</span>
      <span>
        <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.texte }}>
          {t(`agents.${s.cle}`)}
        </span>
      </span>
      <div className="flex gap-1.5 justify-end">
        <button onClick={onReinit} aria-label={t('agents.reinitialiser')} title={t('agents.reinitialiser')} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-coli-cyan hover:text-white flex items-center justify-center transition">
          <i className="ti ti-key" />
        </button>
        <button onClick={onBasculer} aria-label={estActif ? t('agents.suspendre') : t('agents.reactiver')} title={estActif ? t('agents.suspendre') : t('agents.reactiver')} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-coli-orange hover:text-white flex items-center justify-center transition">
          <i className={`ti ${estActif ? 'ti-player-pause' : 'ti-player-play'}`} />
        </button>
        <button onClick={onArchiver} aria-label={t('agents.archiver')} title={t('agents.archiver')} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition">
          <i className="ti ti-archive" />
        </button>
      </div>
    </div>
  );
}

function CarteAgent({
  agent,
  onReinit,
  onBasculer,
  onArchiver,
}: {
  agent: Agent;
  onReinit: () => void;
  onBasculer: () => void;
  onArchiver: () => void;
}) {
  const { t } = useTranslation();
  const s = STATUT[agent.statut] ?? STATUT.ACTIF;
  const estActif = agent.statut === 'ACTIF';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: couleurAvatar(agent.nom) }}>
          {initiales(agent.nom)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-coli-encre truncate">{agent.nom}</div>
          <div className="text-xs text-gray-400 truncate">{agent.email}</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: s.bg, color: s.texte }}>
          {t(`agents.${s.cle}`)}
        </span>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onReinit} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center gap-1">
          <i className="ti ti-key" />
        </button>
        <button onClick={onBasculer} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center gap-1">
          <i className={`ti ${estActif ? 'ti-player-pause' : 'ti-player-play'}`} />
        </button>
        <button onClick={onArchiver} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center gap-1">
          <i className="ti ti-archive" />
        </button>
      </div>
    </div>
  );
}