
import React, { useState, useRef, useEffect } from 'react';
import ResumeCanvas from './components/ResumeCanvas';
import Editor from './components/Editor';
import { INITIAL_RESUME_DATA, EMPTY_RESUME_DATA } from './constants';
import { ResumeData } from './types';
import { Download, Upload, Github, FileJson, Loader2, Copy, Check, Globe, MoreHorizontal, Trash2, Save, FolderOpen, FileDown } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './components/ui';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const { lang, t, toggleLanguage } = useLanguage();
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPromptingOpen, setIsPromptingOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocalManagerOpen, setIsLocalManagerOpen] = useState(false);
  const [savedResumesList, setSavedResumesList] = useState<{id: string, name: string, date: string, data: ResumeData}[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

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
  "education": [
    {
      "id": "1",
      "institution": "Nombre de la Universidad o Institución",
      "degree": "Título obtenido",
      "location": "Ciudad, País",
      "startDate": "Mes Año",
      "endDate": "Mes Año o Presente",
      "gpaOrHonors": "Promedio o Honores (opcional)",
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
      "description": [
        "Descripción del proyecto y tus contribuciones"
      ],
      "link": "Enlace al proyecto (opcional)",
      "date": "Mes Año (opcional)"
    }
  ],
  "skills": [
    {
      "id": "1",
      "category": "Lenguajes de Programación",
      "items": "JavaScript, TypeScript, Python",
      "bullets": [
        "Detalle o logro relevante usando estas tecnologías (opcional)"
      ]
    }
  ],
  "certifications": [
    {
      "id": "1",
      "name": "Nombre de la Certificación",
      "issuer": "Institución Emisora",
      "date": "Mes Año",
      "link": "Enlace a la credencial (opcional)",
      "bullets": [
        "Detalle o logro relevante de la certificación (opcional)"
      ]
    }
  ],
  "workshops": [
    {
      "id": "1",
      "name": "Nombre del Taller / Conferencia",
      "organizer": "Organizador / Institución",
      "date": "Mes Año",
      "location": "Ubicación (opcional)",
      "link": "Enlace al taller/evento (opcional)",
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

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptingGuide);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };


  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-canvas');
    if (!element || isGeneratingPdf) return;

    setIsGeneratingPdf(true);

    const opt = {
      margin: [10, 0, 10, 0],
      filename: `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).output('blob').then((pdfBlob) => {
        const encodedData = `\n%RESUMIFY_DATA:${btoa(encodeURIComponent(JSON.stringify(resumeData)))}%\n`;
        const combinedBlob = new Blob([pdfBlob, encodedData], { type: 'application/pdf' });
        
        const url = URL.createObjectURL(combinedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = opt.filename;
        a.click();
        URL.revokeObjectURL(url);
        setIsGeneratingPdf(false);
      }).catch((err: any) => {
        console.error("PDF generation failed", err);
        setIsGeneratingPdf(false);
      });
    } else {
      alert(t('pdfError'));
      setIsGeneratingPdf(false);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'cv'}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const handleJSONContent = (text: string) => {
      try {
        const parsedData = JSON.parse(text);
        
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
        setSavedResumesList(JSON.parse(stored));
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
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-[#0f172a] text-foreground font-sans app-container">
      
      {/* Editor Panel (Left Sidebar) */}
      <div className="w-full md:w-[420px] flex-shrink-0 z-20 md:h-full flex flex-col border-r border-border bg-white rounded-r-xl shadow-2xl overflow-hidden print:hidden sidebar-panel no-print">
        <div className="p-5 border-b border-border flex justify-between items-center bg-[#0f172a] text-white h-16">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-wide font-serif-custom">RESUMIFY</span>
          </div>
           <a href="https://github.com/ManuelADMN" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
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
        
        {/* Toolbar - Black to match Sidebar */}
        <div className="w-full h-16 bg-[#0f172a] flex items-center justify-between px-6 border-b border-gray-800 shadow-sm z-20 shrink-0 print:hidden toolbar-panel no-print">
            <div className="flex gap-2">
                {/* Left toolbar items if any */}
            </div>
            
            <div className="flex gap-3 items-center">
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
                  value={resumeData.font || 'Merriweather'}
                  onChange={(e) => setResumeData({ ...resumeData, font: e.target.value })}
                  className="bg-[#1e293b] border border-gray-700 text-gray-300 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:text-white font-medium cursor-pointer"
                >
                  <option value="Merriweather">Merriweather ({lang === 'es' ? 'Elegante' : 'Elegant'})</option>
                  <option value="EB Garamond">EB Garamond ({lang === 'es' ? 'Clásica' : 'Classic'})</option>
                  <option value="Lora">Lora ({lang === 'es' ? 'Contemporánea' : 'Contemporary'})</option>
                  <option value="Outfit">Outfit ({lang === 'es' ? 'Minimalista' : 'Minimalist'})</option>
                  <option value="Inter">Inter ({lang === 'es' ? 'Limpia' : 'Clean'})</option>
                  <option value="Playfair Display">Playfair ({lang === 'es' ? 'Contraste' : 'High-contrast'})</option>
                  <option value="JetBrains Mono">JetBrains Mono ({lang === 'es' ? 'Tecnológica' : 'Tech'})</option>
                  <option value="Arial">Arial ({lang === 'es' ? 'Sencilla' : 'Simple'})</option>
                  <option value="Calibri">Calibri ({lang === 'es' ? 'Limpia' : 'Clean'})</option>
                  <option value="Georgia">Georgia ({lang === 'es' ? 'Elegante Serif' : 'Elegant Serif'})</option>
                  <option value="Times New Roman">Times New Roman ({lang === 'es' ? 'Académica' : 'Academic'})</option>
                </select>

                <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-gray-300 hover:bg-white/10 hover:text-white" title="Change Language">
                    <Globe size={16} className="mr-2" />
                    {lang === 'es' ? 'ES' : 'EN'}
                </Button>
                <Button onClick={handleDownloadPDF} size="sm" disabled={isGeneratingPdf} className="bg-white text-black hover:bg-gray-200 font-semibold border-0 min-w-[150px]">
                    {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown size={16} className="mr-2" />}
                    {isGeneratingPdf ? t('generating') : t('downloadPdf')}
                </Button>
            </div>
        </div>

        {/* The Resume Paper Wrapper - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 pb-20 flex justify-center custom-scrollbar scroll-area print:p-0 print:overflow-visible">
            <div className="w-fit h-fit shadow-2xl print:shadow-none animate-in fade-in zoom-in-95 duration-500 origin-top">
              <ResumeCanvas data={resumeData} />
            </div>
        </div>

      </div>

      {/* Prompting Guide Dialog */}
      <Dialog open={isPromptingOpen} onOpenChange={setIsPromptingOpen}>
        <DialogContent className="max-w-2xl bg-[#0f172a] text-white border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('promptingGuide')}</DialogTitle>
            <DialogClose onClick={() => setIsPromptingOpen(false)} className="text-gray-400 hover:text-white" />
          </DialogHeader>
          <div className="p-6 pt-2">
            <p className="text-gray-400 mb-4 text-sm">
              {t('promptingDesc')}
            </p>
            <div className="relative">
              <pre className="bg-[#020817] p-4 rounded-lg overflow-x-auto text-sm text-gray-300 custom-scrollbar max-h-[50vh]">
                <code>{promptingGuide}</code>
              </pre>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyPrompt}
                className="absolute top-2 right-2 bg-white/10 text-white hover:bg-white/20 border-0"
              >
                {isCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                      <h4 className="font-medium text-white mb-1">{item.name}</h4>
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