import React, { useEffect, useRef, useState } from 'react';
import { X, FileDown, Loader2 } from 'lucide-react';
import { ResumeData } from '../types';
import ResumeCanvas from './ResumeCanvas';
import { useLanguage } from '../contexts/LanguageContext';

interface PrintPreviewModalProps {
  data: ResumeData;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  data,
  onClose,
  onDownload,
  isDownloading,
}) => {
  const { t, lang } = useLanguage();
  const measureRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    // Content per page = 297mm − 12mm top margin − 12mm bottom margin = 273mm
    const CONTENT_MM = 273;
    const measure = (el: HTMLElement) => {
      const pxPerMm = el.offsetWidth / 210;
      if (pxPerMm === 0) return;
      const pageContentPx = CONTENT_MM * pxPerMm;
      setPageCount(Math.max(1, Math.ceil(el.scrollHeight / pageContentPx)));
    };

    const existing = document.getElementById('resume-canvas');
    if (existing) { measure(existing); return; }
    const el = measureRef.current;
    if (el) measure(el);
  }, [data]);

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
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-sm">
            {lang === 'es' ? 'Vista de Exportación' : 'Export Preview'}
          </span>
          <span className="text-gray-400 text-xs">
            {pageCount} {lang === 'es' ? (pageCount === 1 ? 'página' : 'páginas') : (pageCount === 1 ? 'page' : 'pages')}
          </span>
          <span className="text-gray-500 text-xs px-2 py-0.5 rounded border border-gray-700">
            {lang === 'es' ? 'La línea azul indica el corte de página' : 'Blue line marks the page break'}
          </span>
        </div>
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
            title={lang === 'es' ? 'Cerrar' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable pages area */}
      <div className="flex-1 overflow-y-auto py-8 flex flex-col items-center gap-8">
        {/* Hidden canvas for measurement fallback */}
        <div
          ref={measureRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            width: '210mm',
          }}
          aria-hidden="true"
        >
          <ResumeCanvas data={data} />
        </div>

        {/* One div per page — each clips the canvas to its slice */}
        {Array.from({ length: pageCount }).map((_, pageIdx) => (
          <div key={pageIdx} className="flex flex-col items-center gap-2">
            {/* Page label */}
            <div className="text-gray-400 text-xs font-medium tracking-wide uppercase">
              {lang === 'es' ? 'Página' : 'Page'} {pageIdx + 1}
            </div>

            {/* Page frame — 297mm tall with 12mm top+bottom margin matching the PDF */}
            <div
              className="relative shadow-2xl overflow-hidden"
              style={{
                width: '210mm',
                height: '297mm',
                backgroundColor: 'white',
              }}
            >
              {/* 12mm top margin (white) then 273mm of canvas content for this page */}
              <div style={{ paddingTop: '12mm' }}>
                <div
                  style={{
                    height: '273mm',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ transform: `translateY(-${pageIdx * 273}mm)` }}>
                    <ResumeCanvas data={data} />
                  </div>
                </div>
              </div>
              {/* Bottom 12mm is automatically white because container height is 297mm */}

              {/* Page number stamp */}
              <div
                className="absolute bottom-2 right-3 pointer-events-none select-none"
                style={{ fontSize: '7pt', color: '#d1d5db' }}
              >
                {pageIdx + 1} / {pageCount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintPreviewModal;
