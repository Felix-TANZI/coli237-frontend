import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listerPersonnes } from '../api/personnes';
import { exporterPersonnesExcel, exporterPersonnesPdf } from '../api/export';
import { BarreNav, BarreNavMobile } from '../composants/BarreNav';
import { LISTE_ROLES } from '../composants/roles';

const OMBRE = '0 1px 3px rgba(14,26,36,.04), 0 4px 16px rgba(14,26,36,.06)';

export function Export() {
  const { t } = useTranslation();
  const [role, setRole] = useState('');

  const { data: personnes = [] } = useQuery({
    queryKey: ['personnes'],
    queryFn: () => listerPersonnes(),
  });

  // Nombre de fiches validees qui seront exportees (selon le role choisi).
  const valides = personnes.filter(
    (p) => p.statut === 'VALIDE' && (role ? p.role === role : true),
  ).length;

  const excel = useMutation({ mutationFn: () => exporterPersonnesExcel(role || undefined) });
  const pdf = useMutation({ mutationFn: () => exporterPersonnesPdf(role || undefined) });

  return (
    <div className="min-h-screen bg-coli-craie pb-20 md:pb-0">
      <BarreNav />

      <main className="px-4 sm:px-6 py-5 sm:py-6 max-w-4xl mx-auto">
        <div className="mb-5">
          <h1
            className="font-extrabold text-xl sm:text-2xl text-coli-encre tracking-tight"
            style={{ fontFamily: 'Sora, Inter' }}
          >
            {t('export.registreTitre')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            {t('export.registreSousTitre')}
          </p>
        </div>

        <div className="flex gap-3 bg-cyan-50/60 border border-cyan-100 rounded-xl p-4 mb-6">
          <i className="ti ti-info-circle text-coli-cyan text-lg shrink-0" />
          <p className="text-xs sm:text-sm text-gray-600">{t('export.registreInfo')}</p>
        </div>

        {/* Filtre par role */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4" style={{ boxShadow: OMBRE }}>
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            {t('export.roleAExporter')}
          </label>
          <div className="relative max-w-sm">
            <i className="ti ti-user-circle absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-coli-encre outline-none appearance-none cursor-pointer hover:border-gray-300 focus:border-coli-cyan focus:ring-4 focus:ring-coli-cyan/10 transition"
            >
              <option value="">{t('export.toutesPersonnes')}</option>
              {LISTE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`roles.${r}`)}
                </option>
              ))}
            </select>
            <i className="ti ti-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {t('export.fichesAExporter', { count: valides })}
          </p>
        </div>

        {/* Cartes export */}
        <div className="grid sm:grid-cols-2 gap-4">
          <CarteExport
            icone="ti-file-spreadsheet"
            couleur="#1FB89E"
            fond="#e8f8f3"
            titre={t('export.formatExcel')}
            texte={t('export.formatExcelTexte')}
            nombre={valides}
            enCours={excel.isPending}
            erreur={excel.isError}
            onClic={() => excel.mutate()}
          />
          <CarteExport
            icone="ti-file-type-pdf"
            couleur="#E24B4A"
            fond="#fdeaea"
            titre={t('export.formatPdf')}
            texte={t('export.formatPdfTexte')}
            nombre={valides}
            enCours={pdf.isPending}
            erreur={pdf.isError}
            onClic={() => pdf.mutate()}
          />
        </div>
      </main>

      <BarreNavMobile />
    </div>
  );
}

function CarteExport({
  icone,
  couleur,
  fond,
  titre,
  texte,
  nombre,
  enCours,
  erreur,
  onClic,
}: {
  icone: string;
  couleur: string;
  fond: string;
  titre: string;
  texte: string;
  nombre: number;
  enCours: boolean;
  erreur: boolean;
  onClic: () => void;
}) {
  const { t } = useTranslation();
  const desactive = nombre === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col" style={{ boxShadow: OMBRE }}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
        style={{ background: fond, color: couleur }}
      >
        <i className={`ti ${icone}`} />
      </div>
      <h3 className="font-semibold text-base text-coli-encre">{titre}</h3>
      <p className="text-xs text-gray-500 mt-1 mb-4 flex-1">{texte}</p>

      {erreur && (
        <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
          <i className="ti ti-alert-circle" />
          {t('export.erreurTelechargement')}
        </p>
      )}

      <button
        onClick={onClic}
        disabled={desactive || enCours}
        className="w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition"
        style={{ background: couleur }}
      >
        <i className={`ti ${enCours ? 'ti-loader-2 animate-spin' : 'ti-download'}`} />
        {enCours ? t('export.generation') : t('export.telechargerN', { n: nombre })}
      </button>
    </div>
  );
}