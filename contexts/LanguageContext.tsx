import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  es: {
    // App
    import: 'Importar',
    export: 'Guardar JSON',
    downloadPdf: 'Descargar PDF',
    generating: 'Generando...',
    promptingGuide: 'Guía de Estructura JSON (Prompting)',
    promptingDesc: 'Puedes copiar esta estructura y pedirle a una IA (como ChatGPT o Gemini) que extraiga tu información de tu viejo CV o perfil de LinkedIn y la adapte a este formato. Luego, simplemente guarda la respuesta en un archivo .json e impórtalo aquí.',
    prompting: 'Prompting',
    clearAll: 'Limpiar Todo',
    clearConfirm: '¿Estás seguro de que quieres borrar todos los datos de tu CV?',
    saveLocal: 'Guardar en el Navegador',
    loadLocal: 'Mis CVs Guardados',
    savedResumes: 'CVs Guardados Localmente',
    noSavedResumes: 'No hay CVs guardados.',
    saveVersionName: 'Nombre del CV (ej: Data Scientist v2)',
    load: 'Cargar',
    versionSaved: '¡CV Guardado!',
    
    // Resume Sections
    summary: 'Resumen',
    education: 'Educación',
    experience: 'Experiencia',
    projects: 'Proyectos',
    certifications: 'Certificaciones',
    skills: 'Habilidades',
    certLink: 'Link Certificación',

    // Editor General
    personalInfo: 'Información Personal',
    fullName: 'Nombre Completo',
    profSummary: 'Resumen Profesional',
    profSummaryPlace: 'Escribe un breve resumen de tu perfil profesional...',
    email: 'Email',
    phone: 'Teléfono',
    location: 'Ubicación',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    website: 'Sitio Web',
    
    // Editor Actions
    add: 'Añadir',
    untitled: 'Sin Título',
    noDesc: 'Sin descripción',
    delete: 'Eliminar',
    cancel: 'Cancelar',
    save: 'Guardar',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esto?',
    
    // Editor Education
    institution: 'Universidad / Escuela',
    degree: 'Título / Grado',
    startDate: 'Fecha Inicio',
    endDate: 'Fecha Fin',
    currentStudy: 'Actualmente estudiando',
    gpa: 'Puntuación / GPA (Opcional)',
    
    // Editor Experience
    company: 'Empresa',
    role: 'Cargo / Título',
    linkOptional: 'Enlace (Opcional)',
    descriptionAchievements: 'Descripción (Logros)',
    describeAchievement: '• Describe un logro...',
    addAchievement: '+ Añadir Logro',
    
    // Editor Projects
    projectName: 'Nombre del Proyecto',
    techSubtitle: 'Tecnologías / Subtítulo',
    dates: 'Fechas',
    linkText: 'Enlace Texto',
    addDetail: '+ Añadir Detalle',
    
    // Editor Certifications
    certName: 'Nombre de la Certificación',
    issuer: 'Emisor / Organización',
    date: 'Fecha',
    linkIdOptional: 'Enlace / ID Credencial (Opcional)',
    
    // Editor Skills
    category: 'Categoría',
    catPlace: 'Ej. Idiomas, Herramientas, Certificaciones',
    itemsList: 'Elementos / Lista',
    itemsPlace: 'Ej. Español, Inglés, Francés',
    
    // Other
    present: 'Presente',
    pdfError: 'La librería de PDF no se ha cargado correctamente. Por favor recarga la página.',
    jsonError: 'Error al leer el archivo JSON. Asegúrate de que el formato sea correcto.',
  },
  en: {
    // App
    import: 'Import',
    export: 'Save JSON',
    downloadPdf: 'Download PDF',
    generating: 'Generating...',
    promptingGuide: 'JSON Structure Guide (Prompting)',
    promptingDesc: 'You can copy this structure and ask an AI (like ChatGPT or Gemini) to extract your information from your old resume or LinkedIn profile and adapt it to this format. Then, simply save the response in a .json file and import it here.',
    prompting: 'Prompting',
    clearAll: 'Clear All',
    clearConfirm: 'Are you sure you want to clear all your resume data?',
    saveLocal: 'Save to Browser',
    loadLocal: 'My Saved Resumes',
    savedResumes: 'Locally Saved Resumes',
    noSavedResumes: 'No saved resumes found.',
    saveVersionName: 'Resume Name (e.g., Data Scientist v2)',
    load: 'Load',
    versionSaved: 'Resume Saved!',
    
    // Resume Sections
    summary: 'Summary',
    education: 'Education',
    experience: 'Experience',
    projects: 'Projects',
    certifications: 'Certifications',
    skills: 'Skills',
    certLink: 'Certification Link',

    // Editor General
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    profSummary: 'Professional Summary',
    profSummaryPlace: 'Write a brief summary of your professional profile...',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    website: 'Website',
    
    // Editor Actions
    add: 'Add',
    untitled: 'Untitled',
    noDesc: 'No description',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    deleteConfirm: 'Are you sure you want to delete this?',
    
    // Editor Education
    institution: 'University / School',
    degree: 'Degree / Major',
    startDate: 'Start Date',
    endDate: 'End Date',
    currentStudy: 'Currently studying',
    gpa: 'GPA / Honors (Optional)',
    
    // Editor Experience
    company: 'Company',
    role: 'Role / Title',
    linkOptional: 'Link (Optional)',
    descriptionAchievements: 'Description (Achievements)',
    describeAchievement: '• Describe an achievement...',
    addAchievement: '+ Add Achievement',
    
    // Editor Projects
    projectName: 'Project Name',
    techSubtitle: 'Technologies / Subtitle',
    dates: 'Dates',
    linkText: 'Link Text',
    addDetail: '+ Add Detail',
    
    // Editor Certifications
    certName: 'Certification Name',
    issuer: 'Issuer / Organization',
    date: 'Date',
    linkIdOptional: 'Link / Credential ID (Optional)',
    
    // Editor Skills
    category: 'Category',
    catPlace: 'e.g. Languages, Tools, Certifications',
    itemsList: 'Items / List',
    itemsPlace: 'e.g. Spanish, English, French',
    
    // Other
    present: 'Present',
    pdfError: 'The PDF library did not load correctly. Please refresh the page.',
    jsonError: 'Error reading JSON file. Make sure the format is correct.',
  }
};

interface LanguageContextProps {
  lang: Language;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('es');

  useEffect(() => {
    // Detect system language
    const systemLang = navigator.language.split('-')[0];
    if (systemLang === 'en') {
      setLang('en');
    }
  }, []);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'es' ? 'en' : 'es'));
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
