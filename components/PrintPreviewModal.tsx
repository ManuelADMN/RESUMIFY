import React, { useEffect, useRef, useState } from 'react';
import { X, FileDown, Loader2 } from 'lucide-react';
import { ResumeData } from '../types';
import ResumeCanvas from './ResumeCanvas';
import { useLanguage } from '../contexts/LanguageContext';

// Must match the pdf margin [12,0,12,0] in App.tsx
const PDF_MARGIN_MM = 12;
// Must match 297 − 12 − 12
const CONTENT_PER_PAGE_MM = 273;
// The data-html2canvas-ignore spacer at the top of ResumeCanvas
const CANVAS_SPACER_MM = 12;

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
    const measure = (el: HTMLElement) => {
      const pxPerMm = el.offsetWidth / 210;
      if (pxPerMm === 0) return;
      // Subtract the spacer from total height to get actual content mm
      const contentMm = (el.scrollHeight / pxPerMm) - CANVAS_SPACER_MM;
      setPageCount(Math.max(1, Math.ceil(contentMm / CONTENT_PER_PAGE_MM)));
    };

    const existing = document.getElementById('resume-canvas');
    if (existing) { measure(existing); return; }
    const el = measureRef.current;
    if (el) measure(el);
  }, [data]);

  /**
   * For a given page index, return:
   *  - startMm: where in the canvas (including spacer) this page starts
   *  - clipMm:  how many mm of canvas to show (fills the content slot)
   *  - marginTopMm: white space above the content (simulates PDF top margin)
   *
   * Page 0:
   *   The canvas spacer (12mm) is part of the slice and acts as the top margin,
   *   so we add no extra paddingTop. Clip = spacer + one content page = 285mm.
   * Page N>0:
   *   Content starts after the spacer + previous pages, add 12mm top white space.
   */
  const pageLayout = (pageIdx: number) => {
    if (pageIdx === 0) {
      return {
        startMm: 0,
        clipMm: CANVAS_SPACER_MM + CONTENT_PER_PAGE_MM, // 285mm
        marginTopMm: 0,
      };
    }
    return {
      startMm: CANVAS_SPACER_MM + pageIdx * CONTENT_PER_PAGE_MM, // 12 + N*273
      clipMm: CONTENT_PER_PAGE_MM, // 273mm
      marginTopMm: PDF_MARGIN_MM, // 12mm white at top of page
    };
  };

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
            {pageCount}{' '}
            {lang === 'es'
              ? pageCount === 1 ? 'página' : 'páginas'
              : pageCount === 1 ? 'page' : 'pages'}
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

        {Array.from({ length: pageCount }).map((_, pageIdx) => {
          const { startMm, clipMm, marginTopMm } = pageLayout(pageIdx);
          return (
            <div key={pageIdx} className="flex flex-col items-center gap-2">
              <div className="text-gray-400 text-xs font-medium tracking-wide uppercase">
                {lang === 'es' ? 'Página' : 'Page'} {pageIdx + 1}
              </div>

              {/* A4 page frame */}
              <div
                className="relative shadow-2xl"
                style={{
                  width: '210mm',
                  height: '297mm',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                }}
              >
                {/* Top margin (white) + content slice */}
                <div style={{ paddingTop: `${marginTopMm}mm`, overflow: 'hidden' }}>
                  <div style={{ height: `${clipMm}mm`, overflow: 'hidden' }}>
                    <div style={{ transform: `translateY(-${startMm}mm)` }}>
                      <ResumeCanvas data={data} />
                    </div>
                  </div>
                </div>
                {/* Bottom margin is automatic white (297 − marginTop − clipMm = 12mm) */}

                <div
                  className="absolute bottom-2 right-3 pointer-events-none select-none"
                  style={{ fontSize: '7pt', color: '#d1d5db' }}
                >
                  {pageIdx + 1} / {pageCount}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrintPreviewModal;
