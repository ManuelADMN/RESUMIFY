import React, { Suspense, lazy } from 'react';
import { X, FileDown, Loader2 } from 'lucide-react';
import { BlobProvider } from '@react-pdf/renderer';
import { ResumeData } from '../types';
import ResumePDFDocument from './ResumePDFDocument';
import { useLanguage } from '../contexts/LanguageContext';

interface PrintPreviewModalProps {
  data: ResumeData;
  lang: string;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  data, lang, onClose, onDownload, isDownloading,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ backgroundColor: '#1e293b' }}
    >
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-3"
        style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}
      >
        <span className="text-white font-semibold text-sm">
          {lang === 'es' ? 'Vista de Exportación — PDF Real' : 'Export Preview — Real PDF'}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'white', color: 'black' }}
          >
            {isDownloading
              ? <Loader2 size={14} className="animate-spin" />
              : <FileDown size={14} />}
            {isDownloading ? t('generating') : t('downloadPdf')}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* PDF iframe — BlobProvider renders the actual PDF and gives us a blob URL */}
      <div className="flex-1 overflow-hidden">
        <BlobProvider document={<ResumePDFDocument data={data} lang={lang} />}>
          {({ url, loading, error }) => {
            if (loading) {
              return (
                <div className="w-full h-full flex items-center justify-center gap-3 text-gray-400">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">{lang === 'es' ? 'Generando PDF…' : 'Generating PDF…'}</span>
                </div>
              );
            }
            if (error) {
              return (
                <div className="w-full h-full flex items-center justify-center text-red-400 text-sm">
                  {lang === 'es' ? 'Error al generar el PDF.' : 'Failed to generate PDF.'}
                </div>
              );
            }
            return (
              <iframe
                src={url!}
                title={lang === 'es' ? 'Vista de Exportación' : 'Export Preview'}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            );
          }}
        </BlobProvider>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
