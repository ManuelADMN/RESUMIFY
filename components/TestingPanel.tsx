import React, { useMemo, useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { ResumeData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TestResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  warning?: boolean;
  message: string;
}

function runTests(data: ResumeData): TestResult[] {
  const results: TestResult[] = [];
  const push = (
    id: string, category: string, name: string,
    passed: boolean, message: string, warning = false
  ) => results.push({ id, category, name, passed, warning, message });

  // ── Personal Info ──────────────────────────────────────────────────────
  push('pi-name', 'Personal Info', 'Full name is set',
    data.personalInfo.fullName.trim().length > 0,
    data.personalInfo.fullName.trim().length > 0
      ? `"${data.personalInfo.fullName}"`
      : 'Empty — will appear blank in export');

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email);
  push('pi-email', 'Personal Info', 'Email is valid',
    emailOk, emailOk ? data.personalInfo.email : `"${data.personalInfo.email}" — invalid format`);

  const summaryLen = data.personalInfo.summary.trim().length;
  push('pi-summary', 'Personal Info', 'Summary length (50–600 chars)',
    summaryLen >= 50 && summaryLen <= 600,
    `${summaryLen} chars`,
    summaryLen > 0 && (summaryLen < 50 || summaryLen > 600));

  // ── Section Order ──────────────────────────────────────────────────────
  const order = data.sectionOrder || [];
  push('so-defined', 'Section Order', 'Section order is defined',
    order.length > 0, `${order.length} sections: ${order.join(', ')}`);

  const hidden = data.hiddenSections || [];
  const visible = order.filter(s => !hidden.includes(s));
  push('so-visible', 'Section Order', 'At least 2 visible sections',
    visible.length >= 2, `${visible.length} visible, ${hidden.length} hidden`);

  // ── Technical Skills ───────────────────────────────────────────────────
  const techSkills = data.technicalSkills || [];
  push('ts-exists', 'Technical Skills', 'Has at least one category',
    techSkills.length > 0,
    techSkills.length > 0 ? `${techSkills.length} categories` : 'No technical skills added');

  const techItemsOk = techSkills.every(s => s.items.trim().length > 0);
  push('ts-items', 'Technical Skills', 'All categories have items',
    techSkills.length === 0 || techItemsOk,
    techItemsOk ? 'All categories non-empty' : 'Some categories have no items listed');

  // ── Languages ──────────────────────────────────────────────────────────
  const langs = data.languages || [];
  push('la-format', 'Languages', 'Language entries have items text',
    langs.length === 0 || langs.every(l => l.items.trim().length > 0),
    langs.length === 0 ? 'No languages added' : `${langs.length} entries, all have text`);

  // ── Experience ─────────────────────────────────────────────────────────
  push('ex-exists', 'Experience', 'Has experience entries',
    data.experience.length > 0,
    data.experience.length > 0 ? `${data.experience.length} entries` : 'No experience added',
    true /* warn only */);

  const expBullets = data.experience.every(
    e => e.bullets && e.bullets.some(b => b.trim().length > 0)
  );
  push('ex-bullets', 'Experience', 'Every entry has at least one bullet',
    data.experience.length === 0 || expBullets,
    data.experience.length === 0 ? 'N/A' : expBullets ? 'All entries have bullets' : 'Some entries have no bullets');

  const expLinks = data.experience.filter(e => e.link && e.link.trim().length > 0);
  const expLinksValid = expLinks.every(e =>
    e.link!.startsWith('http') || e.link!.includes('.')
  );
  push('ex-links', 'Experience', 'Company links are valid URLs',
    expLinks.length === 0 || expLinksValid,
    expLinks.length === 0 ? 'No links to validate' : `${expLinks.length} link(s) — ${expLinksValid ? 'all valid' : 'some invalid'}`);

  // ── Education ──────────────────────────────────────────────────────────
  push('ed-exists', 'Education', 'Has education entries',
    data.education.length > 0,
    data.education.length > 0 ? `${data.education.length} entries` : 'No education added',
    true);

  const edDates = data.education.every(e => e.startDate.trim().length > 0);
  push('ed-dates', 'Education', 'All entries have start date',
    data.education.length === 0 || edDates,
    edDates ? 'All have start dates' : 'Some entries missing start date');

  // ── Projects ───────────────────────────────────────────────────────────
  const projTech = data.projects.every(p => p.technologies.trim().length > 0);
  push('pr-tech', 'Projects', 'All projects have technologies',
    data.projects.length === 0 || projTech,
    data.projects.length === 0 ? 'No projects' : `${data.projects.length} projects — ${projTech ? 'all have tech' : 'some missing tech'}`);

  // ── Certifications ─────────────────────────────────────────────────────
  const certs = data.certifications || [];
  const certLinks = certs.filter(c => c.link && c.link.trim().length > 0);
  const certLinksValid = certLinks.every(c =>
    c.link!.startsWith('http') || c.link!.includes('.')
  );
  push('ce-links', 'Certifications', 'Certification links are valid',
    certLinks.length === 0 || certLinksValid,
    certLinks.length === 0 ? 'No links to validate' : `${certLinks.length} link(s) — ${certLinksValid ? 'valid' : 'some invalid'}`);

  // ── Font ───────────────────────────────────────────────────────────────
  const validFonts = ['Arial', 'Calibri', 'Helvetica', 'Times New Roman'];
  push('fo-valid', 'Settings', 'Font is ATS-safe',
    validFonts.includes(data.font || 'Arial'),
    `Font: "${data.font || 'Arial'}"`);

  // ── PDF Export readiness ───────────────────────────────────────────────
  push('pdf-canvas', 'PDF Export', 'Canvas element exists in DOM',
    !!document.getElementById('resume-canvas'),
    document.getElementById('resume-canvas') ? '#resume-canvas found' : '#resume-canvas not found');

  const h2pdfLoaded = typeof (window as any).html2pdf === 'function';
  push('pdf-lib', 'PDF Export', 'html2pdf library loaded',
    h2pdfLoaded,
    h2pdfLoaded ? 'Library ready' : 'html2pdf not loaded — check index.html script tag');

  return results;
}

interface TestingPanelProps {
  data: ResumeData;
  onClose: () => void;
}

const TestingPanel: React.FC<TestingPanelProps> = ({ data, onClose }) => {
  const { lang } = useLanguage();
  const results = useMemo(() => runTests(data), [data]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const categories: string[] = Array.from(new Set(results.map(r => r.category)));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const warnings = results.filter(r => r.passed && r.warning).length;

  const toggleCategory = (cat: string) =>
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" style={{ backgroundColor: '#0f172a' }}>
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-gray-800"
        style={{ backgroundColor: '#0f172a' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-white font-semibold text-sm">
            {lang === 'es' ? 'Panel de Testing' : 'Testing Panel'}
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle size={13} /> {passed}
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <XCircle size={13} /> {failed}
            </span>
            {warnings > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <AlertCircle size={13} /> {warnings}
              </span>
            )}
            <span className="text-gray-400">/ {results.length} tests</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800 shrink-0">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${(passed / results.length) * 100}%` }}
        />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {categories.map(cat => {
          const catResults = results.filter(r => r.category === cat);
          const catPassed = catResults.filter(r => r.passed).length;
          const catFailed = catResults.filter(r => !r.passed).length;
          const isOpen = openCategories[cat] !== false; // open by default

          return (
            <div key={cat} className="rounded-lg border border-gray-800 overflow-hidden">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                  <span className="text-sm font-medium text-white">{cat}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {catFailed > 0 && <span className="text-red-400">{catFailed} failed</span>}
                  <span className="text-gray-500">{catPassed}/{catResults.length}</span>
                </div>
              </button>

              {isOpen && (
                <div className="divide-y divide-gray-800">
                  {catResults.map(test => (
                    <div key={test.id} className="flex items-start gap-3 px-4 py-2.5">
                      {test.passed ? (
                        test.warning
                          ? <AlertCircle size={15} className="text-yellow-400 mt-0.5 shrink-0" />
                          : <CheckCircle size={15} className="text-green-400 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-200">{test.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{test.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Summary card */}
        <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {lang === 'es' ? 'Reporte' : 'Report'}
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• {results.length} tests executed</div>
            <div className="text-green-400">• {passed} passed ({Math.round((passed / results.length) * 100)}%)</div>
            {failed > 0 && <div className="text-red-400">• {failed} failed — review items above</div>}
            {warnings > 0 && <div className="text-yellow-400">• {warnings} warnings (passed but worth reviewing)</div>}
            <div className="pt-1 text-gray-500">
              Generated: {new Date().toLocaleString(lang === 'es' ? 'es-CL' : 'en-US')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingPanel;
