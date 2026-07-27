import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { listerCoursiers } from '../api/coursiers';
import { listerPartenaires } from '../api/partenaires';
import {
  exporterExcel,
  exporterPdf,
  exporterPartenairesExcel,
  exporterPartenairesPdf,
} from '../api/export';
import { BarreNav, BarreNavMobile } from '../composants/BarreNav';

export function Export() {
  const { t } = useTranslation();

  const { data: coursiers = [] } = useQuery({
    queryKey: ['coursiers'],
    queryFn: listerCoursiers,
  });
  const { data: partenaires = [] } = useQuery({
    queryKey: ['partenaires'],
    queryFn: listerPartenaires,
  });

  const coursiersValides = coursiers.filter((c) => c.statut === 'VALIDE').length;
  const partenairesValides = partenaires.filter((p) => p.statut === 'VALIDE').length;

  const excelC = useMutation({ mutationFn: exporterExcel });
  const pdfC = useMutation({ mutationFn: exporterPdf });
  const excelP = useMutation({ mutationFn: exporterPartenairesExcel });
  const pdfP = useMutation({ mutationFn: exporterPartenairesPdf });

  return (
    <div className="min-h-screen bg-coli-craie pb-20 md:pb-0">
      <BarreNav />

      <main className="px-4 sm:px-6 py-5 sm:py-6 max-w-4xl mx-auto">
        <div className="mb-5">
          <h1 className="font-extrabold text-xl sm:text-2xl text-coli-encre tracking-tight" style={{ fontFamily: 'Sora, Inter' }}>
            {t('export.titre')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            {t('export.sousTitre')}
          </p>
        </div>

        <div className="flex gap-3 bg-cyan-50/60 border border-cyan-100 rounded-xl p-4 mb-6">
          <i className="ti ti-info-circle text-coli-cyan text-lg shrink-0" />
          <p className="text-xs sm:text-sm text-gray-600">{t('export.info')}</p>
        </div>

        {/* Section Coursiers freelance */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <i className="ti ti-motorbike text-coli-vert" />
            <h2 className="font-semibold text-sm text-coli-encre">
              {t('export.sectionCoursiers')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <CarteExport
              icone="ti-file-spreadsheet"
              couleur="#1FB89E"
              fond="#e8f8f3"
              titre={t('export.excelTitre')}
              texte={t('export.excelTexte')}
              nombre={coursiersValides}
              enCours={excelC.isPending}
              erreur={excelC.isError}
              onClic={() => excelC.mutate()}
            />
            <CarteExport
              icone="ti-file-type-pdf"
              couleur="#E24B4A"
              fond="#fdeaea"
              titre={t('export.pdfTitre')}
              texte={t('export.pdfTexte')}
              nombre={coursiersValides}
              enCours={pdfC.isPending}
              erreur={pdfC.isError}
              onClic={() => pdfC.mutate()}
            />
          </div>
        </div>

        {/* Section Partenaires / entreprises */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <i className="ti ti-building-store text-coli-orange" />
            <h2 className="font-semibold text-sm text-coli-encre">
              {t('export.sectionPartenaires')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <CarteExport
              icone="ti-file-spreadsheet"
              couleur="#1FB89E"
              fond="#e8f8f3"
              titre={t('export.excelTitre')}
              texte={t('export.excelTextePartenaire')}
              nombre={partenairesValides}
              enCours={excelP.isPending}
              erreur={excelP.isError}
              onClic={() => excelP.mutate()}
            />
            <CarteExport
              icone="ti-file-type-pdf"
              couleur="#E24B4A"
              fond="#fdeaea"
              titre={t('export.pdfTitre')}
              texte={t('export.pdfTextePartenaire')}
              nombre={partenairesValides}
              enCours={pdfP.isPending}
              erreur={pdfP.isError}
              onClic={() => pdfP.mutate()}
            />
          </div>
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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: fond, color: couleur }}>
        <i className={`ti ${icone}`} />
      </div>
      <h3 className="font-semibold text-base text-coli-encre">{titre}</h3>
      <p className="text-xs text-gray-500 mt-1 mb-4 flex-1">{texte}</p>

      {erreur && (
        <p className="text-xs text-red-600 mb-2 flex items-center gap-1">
          <i className="ti ti-alert-circle" />
          {t('export.erreur')}
        </p>
      )}

      <button
        onClick={onClic}
        disabled={desactive || enCours}
        className="w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition"
        style={{ background: couleur }}
      >
        <i className={`ti ${enCours ? 'ti-loader-2 animate-spin' : 'ti-download'}`} />
        {enCours ? t('export.generation') : `${t('export.telecharger')} (${nombre})`}
      </button>
    </div>
  );
}