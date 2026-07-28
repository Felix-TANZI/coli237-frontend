import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { chargerTableau } from '../api/tableau';
import { BarreNav, BarreNavMobile } from '../composants/BarreNav';
import { RepartitionVehicule } from '../composants/RepartitionVehicule';

function couleurAvatar(nom: string): string {
  const couleurs = ['#1FB89E', '#F28C28', '#17A2B8', '#7F77DD', '#D4537E'];
  let somme = 0;
  for (const c of nom) somme += c.charCodeAt(0);
  return couleurs[somme % couleurs.length];
}

function initiales(nom: string): string {
  return nom
    .split(' ')
    .map((m) => m[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const STATUT_STYLE: Record<string, { bg: string; texte: string; libelle: string }> = {
  VALIDE: { bg: '#e8f8f3', texte: '#0F6E56', libelle: 'Valide' },
  EN_ATTENTE: { bg: '#fdf0e3', texte: '#985a12', libelle: 'En attente' },
  REJETE: { bg: '#fdeaea', texte: '#a32d2d', libelle: 'Rejete' },
};

export function TableauDeBord() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['tableau'],
    queryFn: chargerTableau,
  });

  // Repartition par statut, pour le panneau de droite.
  const parStatut = [
    { cle: 'VALIDE', label: 'Validees', couleur: '#1FB89E', valeur: data?.valides ?? 0 },
    { cle: 'EN_ATTENTE', label: 'En attente', couleur: '#F28C28', valeur: data?.attente ?? 0 },
    { cle: 'REJETE', label: 'Rejetees', couleur: '#E24B4A', valeur: data?.rejetes ?? 0 },
  ];
  const totalStatut = parStatut.reduce((s, x) => s + x.valeur, 0) || 1;

  return (
    <div className="min-h-screen bg-coli-craie pb-20 md:pb-0">
      <BarreNav />

      <main className="px-4 sm:px-6 py-5 sm:py-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_360px] gap-4 sm:gap-5 items-start">
          {/* Colonne gauche : bandeau + roles + recents */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Bandeau d'accueil */}
            <div
              className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(120deg,#0E1A24,#16334a)' }}
            >
              <div className="relative z-10">
                <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight">
                  {t('tableau.titre')}
                </h1>
                <p className="text-white/60 text-xs sm:text-sm mt-1">{t('tableau.sousTitre')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
                  <Metrique valeur={data?.total} label={t('tableau.total')} couleur="#5DCAA5" chargement={isLoading} />
                  <Metrique valeur={data?.livreurs} label={t('tableau.livreurs')} couleur="#F5B87A" chargement={isLoading} />
                  <Metrique valeur={data?.attente} label={t('tableau.attente')} couleur="#fff" chargement={isLoading} />
                  <Metrique valeur={data?.agentsActifs} label={t('tableau.agentsActifs')} couleur="#fff" chargement={isLoading} />
                </div>
              </div>
              <div
                className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle,#1FB89E,transparent 70%)' }}
              />
            </div>

            {/* Répartition par rôle */}
            <RepartitionVehicule parVehicule={data?.parRole ?? []} />

            {/* Recensements récents */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-sm text-coli-encre">{t('tableau.recents')}</h2>
                <span className="text-xs text-coli-cyan font-medium cursor-pointer">
                  {t('tableau.toutVoir')}
                </span>
              </div>

              {isLoading && (
                <p className="text-sm text-gray-400 py-6 text-center">{t('tableau.chargement')}</p>
              )}
              {!isLoading && data?.recents.length === 0 && (
                <p className="text-sm text-gray-400 py-6 text-center">{t('tableau.aucuneDonnee')}</p>
              )}

              {data?.recents.map((r) => {
                const s = STATUT_STYLE[r.statut] ?? STATUT_STYLE.EN_ATTENTE;
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-none"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white shrink-0"
                      style={{ background: couleurAvatar(r.nom) }}
                    >
                      {initiales(r.nom)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-coli-encre truncate">{r.nom}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {r.type} · {r.lieu}
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full ml-auto shrink-0"
                      style={{ background: s.bg, color: s.texte }}
                    >
                      {s.libelle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonne droite : etat des validations + classement agents */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Etat des validations */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <h2 className="font-semibold text-sm text-coli-encre mb-4">
                {t('tableau.etatValidations')}
              </h2>

              <div className="flex h-3 rounded-full overflow-hidden mb-4">
                {parStatut.map((x) => (
                  <div
                    key={x.cle}
                    style={{ width: `${(x.valeur / totalStatut) * 100}%`, background: x.couleur }}
                    title={`${x.label} : ${x.valeur}`}
                  />
                ))}
              </div>

              <div className="space-y-3">
                {parStatut.map((x) => (
                  <div key={x.cle} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: x.couleur }}
                    />
                    <span className="text-sm text-gray-600 flex-1">{x.label}</span>
                    <span className="text-sm font-semibold text-coli-encre">{x.valeur}</span>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {Math.round((x.valeur / totalStatut) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Classement des agents les plus actifs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <h2 className="font-semibold text-sm text-coli-encre mb-4">
                {t('tableau.classementAgents')}
              </h2>

              {(!data || data.classementAgents.length === 0) && (
                <p className="text-xs text-gray-400 py-4 text-center">
                  {t('tableau.aucuneDonnee')}
                </p>
              )}

              <div className="space-y-3">
                {data?.classementAgents.map((a, i) => {
                  const max = data.classementAgents[0]?.nombre || 1;
                  const medailles = ['#F5B14C', '#B8C2CC', '#C88B5A'];
                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{
                          background: i < 3 ? medailles[i] : '#eceff1',
                          color: i < 3 ? '#fff' : '#8a99a3',
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-coli-encre font-medium truncate">
                            {a.nom}
                          </span>
                          <span className="text-xs font-semibold text-gray-500 shrink-0 ml-2">
                            {a.nombre}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(a.nombre / max) * 100}%`, background: '#1FB89E' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BarreNavMobile />
    </div>
  );
}

function Metrique({
  valeur,
  label,
  couleur,
  chargement,
}: {
  valeur?: number;
  label: string;
  couleur: string;
  chargement: boolean;
}) {
  return (
    <div>
      <div
        className="font-extrabold text-2xl sm:text-3xl leading-none"
        style={{ color: couleur, fontFamily: 'Sora, Inter, sans-serif' }}
      >
        {chargement ? '·' : (valeur ?? 0)}
      </div>
      <div className="text-[11px] sm:text-xs text-white/60 mt-1">{label}</div>
    </div>
  );
}