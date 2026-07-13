
import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import ResumeCanvas from './components/ResumeCanvas';
import Editor from './components/Editor';

// Lazy-loaded so @react-pdf/renderer (pulled in by PrintPreviewModal) stays out
// of the initial bundle and only loads when the preview/testing panel is opened.
const PrintPreviewModal = lazy(() => import('./components/PrintPreviewModal'));
const TestingPanel = lazy(() => import('./components/TestingPanel'));
import { INITIAL_RESUME_DATA, EMPTY_RESUME_DATA } from './constants';
import { ResumeData } from './types';
import { Download, Upload, Github, FileJson, Loader2, Copy, Check, Globe, MoreHorizontal, Trash2, Save, FolderOpen, FileDown, Monitor, FlaskConical, ExternalLink } from 'lucide-react';
import { LinkedInMark, LinkedInGlyph } from './components/LinkedInIcon';

const DENOISE_LINKEDIN_URL = 'https://www.linkedin.com/company/126953982';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './components/ui';
import { useLanguage } from './contexts/LanguageContext';

interface SavedResume {
  id: string;
  name: string;
  fileName: string;
  date: string;
  data: ResumeData;
}

const toPdfFileName = (value: string, data: ResumeData) => {
  const fallback = data.personalInfo?.fullName?.trim() || 'CV';
  const base = (value.trim() || fallback)
    .replace(/\.pdf$/i, '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .trim();
  return `${base || 'CV'}.pdf`;
};

const normalizeSavedResume = (item: any, index: number): SavedResume | null => {
  if (!item?.data) return null;
  const name = String(item.name || item.fileName || item.filename || item.title || item.data.personalInfo?.fullName || `CV ${index + 1}`);
  return {
    id: String(item.id || `legacy-${index}`),
    name: name.replace(/\.pdf$/i, ''),
    fileName: toPdfFileName(String(item.fileName || item.filename || name), item.data),
    date: String(item.date || ''),
    data: item.data,
  };
};

const App: React.FC = () => {
  const { lang, t, toggleLanguage } = useLanguage();
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPromptingOpen, setIsPromptingOpen] = useState(false);
  const [promptTab, setPromptTab] = useState<'ai' | 'json'>('ai');
  const [copiedTarget, setCopiedTarget] = useState<'ai' | 'json' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocalManagerOpen, setIsLocalManagerOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isTestingOpen, setIsTestingOpen] = useState(false);
  const [savedResumesList, setSavedResumesList] = useState<SavedResume[]>([]);
  const [showFollowGate, setShowFollowGate] = useState(false);
  const [hasClickedFollow, setHasClickedFollow] = useState(false);
  const [followReady, setFollowReady] = useState(false);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // First-visit gate: ask the user to follow Denoise on LinkedIn (once per browser).
  useEffect(() => {
    if (!localStorage.getItem('resumify_followed_linkedin')) {
      setShowFollowGate(true);
    }
    return () => { if (waitTimerRef.current) clearTimeout(waitTimerRef.current); };
  }, []);

  const handleFollowClick = () => {
    window.open(DENOISE_LINKEDIN_URL, '_blank', 'noopener,noreferrer');
    if (hasClickedFollow) return; // don't restart the wait on repeat clicks
    // Persist as soon as they click "Follow" so the gate never reappears in this
    // browser, even if they close the tab before pressing "Continue".
    localStorage.setItem('resumify_followed_linkedin', 'true');
    setHasClickedFollow(true);
    waitTimerRef.current = setTimeout(() => setFollowReady(true), 20000);
  };

  const handleContinueFromGate = () => {
    localStorage.setItem('resumify_followed_linkedin', 'true');
    setShowFollowGate(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('resumify_current_draft');
    if (savedDraft) {
      try {
        setResumeData(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to load saved draft", e);
      }
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    if (resumeData && resumeData !== INITIAL_RESUME_DATA && resumeData !== EMPTY_RESUME_DATA) {
      localStorage.setItem('resumify_current_draft', JSON.stringify(resumeData));
    }
  }, [resumeData]);

  const promptingGuide = `{
  "sectionOrder": [
    "technicalSkills",
    "education",
    "experience",
    "projects",
    "certifications",
    "skills",
    "languages",
    "workshops",
    "links"
  ],
  "hiddenSections": [],
  "font": "Arial",
  "personalInfo": {
    "fullName": "Tu Nombre Completo",
    "email": "tu@email.com",
    "phone": "+123456789",
    "linkedin": "linkedin.com/in/tu-perfil",
    "github": "github.com/tu-usuario",
    "location": "Tu Ciudad, País",
    "website": "tu-sitio-web.com",
    "summary": "Un breve resumen profesional sobre ti."
  },
  "technicalSkills": [
    {
      "id": "1",
      "category": "Tecnologías",
      "items": "JavaScript, TypeScript, React, Node.js, Python"
    },
    {
      "id": "2",
      "category": "Herramientas",
      "items": "Git, Docker, VS Code, Figma"
    }
  ],
  "languages": [
    {
      "id": "1",
      "category": "",
      "items": "Español [Nativo], Inglés [Intermedio]"
    }
  ],
  "education": [
    {
      "id": "1",
      "institution": "Nombre de la Universidad o Institución",
      "degree": "Título obtenido",
      "location": "Ciudad, País",
      "startDate": "Mes Año",
      "endDate": "Mes Año o Presente",
      "gpaOrHonors": "Promedio o Honores (opcional)",
      "subtitles": ["Área de especialización (opcional)"],
      "bullets": [
        "Detalle o logro académico destacado (opcional)"
      ]
    }
  ],
  "experience": [
    {
      "id": "1",
      "company": "Nombre de la Empresa",
      "role": "Tu Cargo o Rol",
      "location": "Ciudad, País o Remoto",
      "startDate": "Mes Año",
      "endDate": "Mes Año o Presente",
      "subtitles": ["Tipo de contrato (opcional)"],
      "bullets": [
        "Responsabilidad o logro clave 1",
        "Responsabilidad o logro clave 2"
      ],
      "link": "Enlace a la empresa (opcional)"
    }
  ],
  "projects": [
    {
      "id": "1",
      "name": "Nombre del Proyecto",
      "technologies": "React, TypeScript, Tailwind",
      "startDate": "Mes Año (opcional)",
      "endDate": "Mes Año o Presente (opcional)",
      "subtitles": ["Organización o contexto (opcional)"],
      "description": [
        "Descripción del proyecto y tus contribuciones"
      ],
      "link": "Enlace al proyecto (opcional)"
    }
  ],
  "certifications": [
    {
      "id": "1",
      "name": "Nombre de la Certificación",
      "issuer": "Institución Emisora",
      "startDate": "Mes Año",
      "endDate": "Mes Año (opcional)",
      "link": "Enlace a la credencial (opcional)",
      "bullets": [
        "Detalle o logro relevante (opcional)"
      ]
    }
  ],
  "skills": [
    {
      "id": "1",
      "category": "Habilidades Blandas",
      "items": "Trabajo en equipo, Comunicación, Adaptabilidad",
      "bullets": []
    }
  ],
  "workshops": [
    {
      "id": "1",
      "name": "Nombre del Taller / Conferencia",
      "organizer": "Organizador / Institución",
      "startDate": "Mes Año",
      "endDate": "Mes Año (opcional)",
      "location": "Ubicación (opcional)",
      "link": "Enlace al taller/evento (opcional)",
      "subtitles": [],
      "bullets": [
        "Detalle o aprendizaje del taller (opcional)"
      ]
    }
  ],
  "links": [
    {
      "id": "1",
      "label": "Título del Enlace",
      "url": "enlace-url.com"
    }
  ]
}`;

  const aiPrompt = (lang === 'es'
    ? `Eres un asistente experto en redacción de currículums ATS-friendly. A partir de mi información (más abajo), rellena EXACTAMENTE la siguiente estructura JSON de CV.

Reglas:
- Devuelve ÚNICAMENTE el JSON válido, sin texto adicional, sin explicaciones y sin bloques de código markdown.
- Respeta todas las claves y el orden. No inventes datos: deja los campos como "" o los arrays como [] si no tienes esa información.
- Mantén cada "id" como una cadena única.
- En los "bullets" usa verbos de acción y logros medibles cuando sea posible.
- Conserva "sectionOrder", "hiddenSections" y "font" tal cual, salvo que yo indique lo contrario.

Estructura JSON a rellenar:
${promptingGuide}

Mi información:
[Pega aquí tu experiencia, educación, habilidades, proyectos, etc.]`
    : `You are an expert ATS-friendly resume writer. Using my details (below), fill in EXACTLY the following resume JSON structure.

Rules:
- Return ONLY valid JSON, with no extra text, no explanations and no markdown code fences.
- Keep every key and the ordering. Do not invent data: leave fields as "" or arrays as [] when you don't have the information.
- Keep each "id" as a unique string.
- In "bullets" use action verbs and measurable achievements when possible.
- Keep "sectionOrder", "hiddenSections" and "font" as-is unless I say otherwise.

JSON structure to fill:
${promptingGuide}

My details:
[Paste your experience, education, skills, projects, etc. here]`);

  const handleCopy = (target: 'ai' | 'json') => {
    navigator.clipboard.writeText(target === 'ai' ? aiPrompt : promptingGuide);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  };


  const handleDownloadPDF = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      // Lazy-load react-pdf to keep initial bundle small
      const [{ pdf }, { default: ResumePDFDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./components/ResumePDFDocument'),
      ]);
      const name = resumeData.personalInfo.fullName.trim().replace(/\s+/g, '_') || 'CV';
      const blob = await pdf(
        React.createElement(ResumePDFDocument, { data: resumeData, lang })
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed', error);
      alert(t('pdfError'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'denoise_cv.json';
    a.click();
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
    alert(t('exportedToDownloads'));
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const handleJSONContent = (text: string) => {
      try {
        const parsedData = JSON.parse(text);

        // Normalize languages: {name, proficiency, bullets} → {category, items, bullets}
        if (Array.isArray(parsedData.languages)) {
          parsedData.languages = parsedData.languages.map((lang: any) => {
            if ('name' in lang) {
              const level = lang.proficiency?.trim() ||
                (Array.isArray(lang.bullets) && lang.bullets[0]?.trim()) || '';
              const items = level ? `${lang.name.trim()} [${level}]` : lang.name.trim();
              return { id: lang.id, category: '', items, bullets: [] };
            }
            return lang;
          });
        }

        // If technicalSkills is absent but skills has items and the sectionOrder expects
        // technicalSkills (not skills), promote skills → technicalSkills automatically
        const order: string[] = parsedData.sectionOrder || [];
        const wantsTech = order.includes('technicalSkills');
        const wantsSkills = order.includes('skills');
        if (
          wantsTech && !wantsSkills &&
          (!parsedData.technicalSkills || parsedData.technicalSkills.length === 0) &&
          Array.isArray(parsedData.skills) && parsedData.skills.length > 0
        ) {
          parsedData.technicalSkills = parsedData.skills;
          parsedData.skills = [];
        }

        // Smart Merge Logic
        setResumeData(prev => ({
            ...prev,
            ...parsedData,
            personalInfo: {
                ...prev.personalInfo,
                ...(parsedData.personalInfo || {})
            }
        }));
      } catch (error) {
        alert(t('jsonError'));
      }
    };

    if (file.name.endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target?.result as string;
        const match = text.match(/%RESUMIFY_DATA:(.*)%/);
        if (match && match[1]) {
          try {
            const decoded = decodeURIComponent(atob(match[1]));
            handleJSONContent(decoded);
          } catch (err) {
            alert("Los datos del PDF están corruptos.");
          }
        } else {
          alert("No se encontraron datos de CV en este PDF. Asegúrate de que fue exportado desde Resumify.");
        }
      };
      reader.readAsText(file, "UTF-8");
    } else {
      const fileReader = new FileReader();
      fileReader.onload = e => {
        if (e.target?.result) handleJSONContent(e.target.result as string);
      };
      fileReader.readAsText(file, "UTF-8");
    }
    
    event.target.value = '';
    setIsMenuOpen(false);
  };

  const handleClearAll = () => {
    if (window.confirm(t('clearConfirm'))) {
      setResumeData(EMPTY_RESUME_DATA);
      setIsMenuOpen(false);
    }
  };

  const loadLocalSaves = () => {
    try {
      const stored = localStorage.getItem('resumify_saved_cvs');
      if (stored) {
        const parsed = JSON.parse(stored);
        const normalized = Array.isArray(parsed)
          ? parsed.map(normalizeSavedResume).filter((item): item is SavedResume => item !== null)
          : [];
        setSavedResumesList(normalized);
      } else {
        setSavedResumesList([]);
      }
    } catch (e) {
      console.error(e);
      setSavedResumesList([]);
    }
  };

  const handleSaveLocal = () => {
    setIsMenuOpen(false);
    const existingName = resumeData.personalInfo?.fullName ? `CV ${resumeData.personalInfo.fullName}` : 'Version 1';
    const versionName = window.prompt(t('saveVersionName'), existingName);
    if (!versionName) return;

    try {
      const stored = localStorage.getItem('resumify_saved_cvs');
      const resumes = stored ? JSON.parse(stored) : [];
      const newResume = {
        id: Date.now().toString(),
        name: versionName,
        fileName: toPdfFileName(versionName, resumeData),
        date: new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        data: resumeData
      };
      localStorage.setItem('resumify_saved_cvs', JSON.stringify([newResume, ...resumes]));
      alert(t('versionSaved'));
    } catch (e) {
      console.error(e);
      alert('Error saving data');
    }
  };

  const handleOpenLocalManager = () => {
    setIsMenuOpen(false);
    loadLocalSaves();
    setIsLocalManagerOpen(true);
  };

  const handleLoadLocal = (data: ResumeData) => {
    setResumeData(data);
    setIsLocalManagerOpen(false);
  };

  const handleDeleteLocal = (id: string) => {
    try {
      const updated = savedResumesList.filter(item => item.id !== id);
      setSavedResumesList(updated);
      localStorage.setItem('resumify_saved_cvs', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col md:flex-row overflow-hidden bg-[#0f172a] text-foreground font-sans app-container">

      {/* First-visit gate: follow Denoise on LinkedIn */}
      {showFollowGate && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print">
          <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#131f38] to-[#1e293b] border border-white/10 shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-5 w-fit">
              <LinkedInMark size={56} className="rounded-xl shadow-lg" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{t('followTitle')}</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">{t('followDesc')}</p>

            <button
              onClick={handleFollowClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0A66C2] hover:bg-[#0959a8] text-white font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <LinkedInGlyph size={18} />
              {t('followCta')}
              <ExternalLink size={15} className="opacity-80" />
            </button>

            <button
              onClick={handleContinueFromGate}
              disabled={!followReady}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed bg-white/10 text-white hover:bg-white/20 disabled:hover:bg-white/10"
            >
              {hasClickedFollow && !followReady ? (
                <><LinkedInMark size={16} className="rounded animate-pulse" /> {t('waiting')}</>
              ) : (
                t('followContinue')
              )}
            </button>

            {!hasClickedFollow && (
              <p className="mt-3 text-xs text-gray-500">{t('followHint')}</p>
            )}
          </div>
        </div>
      )}

      {/* Editor Panel (Left Sidebar) */}
      <div className="w-full md:w-[420px] flex-shrink-0 z-20 h-[45vh] md:h-full flex flex-col border-b md:border-b-0 md:border-r border-border bg-white md:rounded-r-xl shadow-2xl overflow-hidden print:hidden sidebar-panel no-print">
        <div className="px-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-br from-[#0f172a] via-[#131f38] to-[#1e293b] text-white h-16">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-wide font-serif-custom">RESUMIFY</span>
          </div>
           <a href="https://github.com/ManuelADMN" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50">
            <Github size={20} />
           </a>
        </div>
        
        {/* Scrollable Editor Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
            <Editor data={resumeData} onChange={setResumeData} />
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-zinc-900/50 overflow-hidden relative flex flex-col h-full preview-panel">
        
        {/* Toolbar - matches the sidebar header gradient */}
        <div className="w-full h-16 bg-gradient-to-r from-[#0f172a] via-[#131f38] to-[#0f172a] flex items-center justify-between px-3 md:px-6 border-b border-white/10 shadow-sm z-20 shrink-0 print:hidden toolbar-panel no-print">
            <div className="hidden md:flex gap-2">
                {/* Left toolbar items if any */}
            </div>

            <div className="flex gap-1.5 md:gap-3 items-center w-full md:w-auto justify-end">
                <div className="relative" ref={menuRef}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="text-gray-300 hover:bg-white/10 hover:text-white px-2"
                  >
                    <MoreHorizontal size={20} />
                  </Button>
                  
                  {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                      <div className="flex flex-col py-1 text-sm text-gray-300">
                        <button 
                          onClick={handleSaveLocal} 
                          className="flex items-center px-4 py-2 hover:bg-white/10 hover:text-white transition-colors text-left"
                        >
                          <Save size={14} className="mr-3 text-emerald-400" />
                          {t('saveLocal')}
                        </button>
                        <button 
                          onClick={handleOpenLocalManager} 
                          className="flex items-center px-4 py-2 hover:bg-white/10 hover:text-white transition-colors text-left"
                        >
                          <FolderOpen size={14} className="mr-3 text-sky-400" />
                          {t('loadLocal')}
                        </button>
                        <div className="h-px bg-gray-700 my-1 mx-2" />
                        <button 
                          onClick={() => {
                            setIsPromptingOpen(true);
                            setIsMenuOpen(false);
                          }} 
                          className="flex items-center px-4 py-2 hover:bg-white/10 hover:text-white transition-colors text-left"
                        >
                          <FileJson size={14} className="mr-3" />
                          {t('prompting')}
                        </button>
                        <div className="relative flex items-center px-4 py-2 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                          <Upload size={14} className="mr-3 shrink-0" />
                          <span>{t('import')}</span>
                          <input type="file" onChange={handleImportJSON} className="absolute inset-0 opacity-0 cursor-pointer" accept=".json,.pdf" />
                        </div>
                        <button 
                          onClick={handleExportJSON} 
                          className="flex items-center px-4 py-2 hover:bg-white/10 hover:text-white transition-colors text-left"
                        >
                          <Download size={14} className="mr-3" />
                          {t('export')}
                        </button>
                        <div className="h-px bg-gray-700 my-1 mx-2" />
                        <button 
                          onClick={handleClearAll} 
                          className="flex items-center px-4 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left"
                        >
                          <Trash2 size={14} className="mr-3" />
                          {t('clearAll')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <select
                  value={resumeData.font || 'Arial'}
                  onChange={(e) => setResumeData({ ...resumeData, font: e.target.value })}
                  title={lang === 'es' ? 'Fuente (todas ATS-friendly)' : 'Font (all ATS-friendly)'}
                  className="hidden sm:block bg-[#1e293b] border border-gray-700 text-gray-300 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:text-white font-medium cursor-pointer max-w-[170px]"
                >
                  <option value="Arial">Arial ({lang === 'es' ? 'ATS-friendly' : 'ATS-friendly'})</option>
                  <option value="Calibri">Calibri ({lang === 'es' ? 'ATS-friendly' : 'ATS-friendly'})</option>
                  <option value="Helvetica">Helvetica ({lang === 'es' ? 'ATS-friendly' : 'ATS-friendly'})</option>
                  <option value="Times New Roman">Times New Roman ({lang === 'es' ? 'ATS-friendly' : 'ATS-friendly'})</option>
                </select>

                <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-gray-300 hover:bg-white/10 hover:text-white px-2 sm:px-3" title="Change Language">
                    <Globe size={16} className="sm:mr-2" />
                    <span className="hidden sm:inline">{lang === 'es' ? 'ES' : 'EN'}</span>
                </Button>
                {/* Tests button — developer-only, hidden in production */}
                {import.meta.env.DEV && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTestingOpen(true)}
                    className="text-gray-500 hover:bg-white/10 hover:text-white"
                    title="Testing Panel (dev only)"
                  >
                    <FlaskConical size={14} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPrintPreviewOpen(true)}
                  className="text-gray-300 hover:bg-white/10 hover:text-white px-2 sm:px-3"
                  title={lang === 'es' ? 'Vista de Exportación' : 'Export Preview'}
                >
                  <Monitor size={16} className="sm:mr-2" />
                  <span className="hidden sm:inline">{lang === 'es' ? 'Vista' : 'Preview'}</span>
                </Button>
                <Button onClick={handleDownloadPDF} size="sm" disabled={isGeneratingPdf} className="bg-white text-black hover:bg-gray-200 font-semibold border-0 px-3 min-w-0 sm:min-w-[150px] shadow-lg shadow-black/20 hover:shadow-xl transition-all whitespace-nowrap">
                    {isGeneratingPdf ? <Loader2 className="sm:mr-2 h-4 w-4 animate-spin" /> : <FileDown size={16} className="sm:mr-2" />}
                    <span className="hidden sm:inline">{isGeneratingPdf ? t('generating') : t('downloadPdf')}</span>
                    <span className="sm:hidden">PDF</span>
                </Button>
            </div>
        </div>

        {/* The Resume Paper Wrapper - Scrollable (A4 is 210mm wide; allow horizontal pan on small screens) */}
        <div className="flex-1 overflow-auto p-3 sm:p-8 pb-20 flex justify-start sm:justify-center custom-scrollbar scroll-area print:p-0 print:overflow-visible">
            <div className="w-fit h-fit shadow-2xl print:shadow-none animate-in fade-in zoom-in-95 duration-500 origin-top mx-auto">
              <ResumeCanvas data={resumeData} />
            </div>
        </div>

      </div>

      {/* Prompting Guide Dialog */}
      <Dialog open={isPromptingOpen} onOpenChange={setIsPromptingOpen}>
        <DialogContent className="max-w-2xl bg-[#0f172a] text-white border border-white/10 shadow-2xl">
          <DialogHeader className="border-white/10">
            <DialogTitle className="text-xl">{t('promptingGuide')}</DialogTitle>
            <DialogClose onClick={() => setIsPromptingOpen(false)} className="text-gray-400 hover:text-white" />
          </DialogHeader>
          <div className="p-6 pt-4">
            {/* Tabs */}
            <div className="inline-flex items-center gap-1 p-1 mb-4 rounded-lg bg-white/5 border border-white/10">
              <button
                onClick={() => setPromptTab('ai')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  promptTab === 'ai' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('aiPromptTab')}
              </button>
              <button
                onClick={() => setPromptTab('json')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  promptTab === 'json' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t('jsonTab')}
              </button>
            </div>

            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              {promptTab === 'ai' ? t('aiPromptDesc') : t('promptingDesc')}
            </p>

            <div>
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => handleCopy(promptTab)}
                  aria-live="polite"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  {copiedTarget === promptTab
                    ? <><Check size={14} className="text-emerald-400" /> {t('copied')}</>
                    : <><Copy size={14} /> {promptTab === 'ai' ? t('copyAiPrompt') : t('copyJsonOnly')}</>}
                </button>
              </div>
              <pre className="bg-[#020817] p-4 rounded-lg overflow-auto text-sm text-gray-300 custom-scrollbar max-h-[46vh] ring-1 ring-white/10">
                <code>{promptTab === 'ai' ? aiPrompt : promptingGuide}</code>
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Testing Panel */}
      {isTestingOpen && (
        <Suspense fallback={null}>
          <TestingPanel data={resumeData} onClose={() => setIsTestingOpen(false)} />
        </Suspense>
      )}

      {/* Print Preview Modal */}
      {isPrintPreviewOpen && (
        <Suspense fallback={null}>
          <PrintPreviewModal
            data={resumeData}
            lang={lang}
            onClose={() => setIsPrintPreviewOpen(false)}
            onDownload={handleDownloadPDF}
            isDownloading={isGeneratingPdf}
          />
        </Suspense>
      )}

      {/* Local Manager Dialog */}
      <Dialog open={isLocalManagerOpen} onOpenChange={setIsLocalManagerOpen}>
        <DialogContent className="max-w-2xl bg-[#0f172a] text-white border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('savedResumes')}</DialogTitle>
            <DialogClose onClick={() => setIsLocalManagerOpen(false)} className="text-gray-400 hover:text-white" />
          </DialogHeader>
          <div className="p-6">
            {savedResumesList.length === 0 ? (
              <p className="text-gray-400 text-center py-8">{t('noSavedResumes')}</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {savedResumesList.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-medium text-white mb-1 break-all" title={item.fileName}>{item.fileName}</h4>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button 
                        size="sm" 
                        onClick={() => handleLoadLocal(item.data)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none border-0"
                      >
                        {t('load')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteLocal(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-none"
                        title={t('delete')}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default App;
