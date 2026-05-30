import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en';

type Translations = {
  [key in Language]: { [key: string]: string };
};

const translations: Translations = {
  es: {
    // App
    import: 'Importar',
    export: 'Guardar JSON',
    downloadPdf: 'Descargar PDF',
    generating: 'Generando...',
    promptingGuide: 'Estructura JSON del CV',
    promptingDesc: 'Copia esta estructura y úsala como plantilla para rellenar tu CV. También puedes importar directamente un archivo .json o un PDF exportado previamente desde Resumify.',
    prompting: 'Ver estructura JSON',
    clearAll: 'Limpiar Todo',
    clearConfirm: '¿Estás seguro de que quieres borrar todos los datos de tu CV?',
    saveLocal: 'Guardar en el Navegador',
    loadLocal: 'Mis CVs Guardados',
    savedResumes: 'CVs Guardados Localmente',
    noSavedResumes: 'No hay CVs guardados.',
    saveVersionName: 'Nombre del CV (ej: Data Scientist v2)',
    load: 'Cargar',
    delete: 'Eliminar',
    versionSaved: '¡CV Guardado!',

    // Resume Sections
    summary: 'Resumen',
    education: 'Educación',
    experience: 'Experiencia',
    projects: 'Proyectos',
    certifications: 'Certificaciones',
    skills: 'Habilidades',
    technicalSkills: 'Habilidades Técnicas',
    languages: 'Idiomas',
    certLink: 'Ver Certificación',

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
    cancel: 'Cancelar',
    save: 'Guardar',
    show: 'Mostrar sección',
    hide: 'Ocultar sección',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esto?',

    // Education
    institution: 'Universidad / Escuela',
    companyOrg: 'Empresa / Organización',
    degree: 'Título / Grado',
    startDate: 'Fecha Inicio',
    endDate: 'Fecha Fin',
    currentStudy: 'Actualmente estudiando',
    gpa: 'Promedio / GPA (Opcional)',

    // Experience
    company: 'Empresa',
    role: 'Cargo / Título',
    linkOptional: 'Enlace (Opcional)',
    descriptionAchievements: 'Descripción (Logros)',
    describeAchievement: '• Describe un logro...',
    addAchievement: '+ Añadir Logro',
    bulletsDescription: 'Descripción (Puntos Clave)',
    describeBullet: '• Escribe un detalle o logro...',
    addBullet: '+ Añadir Punto',

    // Projects
    projectName: 'Nombre del Proyecto',
    techSubtitle: 'Tecnologías',
    dates: 'Fechas',
    linkText: 'Enlace',
    addDetail: '+ Añadir Detalle',

    // Certifications
    certName: 'Nombre de la Certificación',
    issuer: 'Emisor / Organización',
    date: 'Fecha',
    linkIdOptional: 'Enlace / ID Credencial (Opcional)',

    // Skills
    category: 'Categoría',
    catPlace: 'Ej. Idiomas, Herramientas, Frameworks',
    itemsList: 'Elementos',
    itemsPlace: 'Ej. Español, Inglés, Francés',

    // Technical Skills
    techCatPlace: 'Ej. Tecnologías, Herramientas, Frameworks',
    techItemsPlace: 'Ej. JavaScript, TypeScript, React, Docker',

    // Languages
    langCatPlace: 'Ej. Idiomas (opcional)',
    langItemsPlace: 'Ej. Español [Nativo], Inglés [Intermedio]',

    // Workshops
    workshops: 'Talleres / Conferencias',
    workshopName: 'Nombre del Taller / Conferencia',
    organizer: 'Organizador / Institución',
    addWorkshop: '+ Añadir Taller/Conferencia',

    // Links
    links: 'Enlaces',
    linkLabel: 'Título del Enlace',
    linkUrl: 'URL del Enlace',
    addLink: '+ Añadir Enlace',
    subtitles: 'Subtítulo',
    addSubtitle: '+ Añadir Subtítulo',

    // Other
    present: 'Presente',
    pdfError: 'La librería de PDF no se ha cargado. Por favor recarga la página.',
    jsonError: 'Error al leer el archivo. Asegúrate de que el formato sea correcto.',
  },
  en: {
    // App
    import: 'Import',
    export: 'Save JSON',
    downloadPdf: 'Download PDF',
    generating: 'Generating...',
    promptingGuide: 'Resume JSON Structure',
    promptingDesc: 'Copy this structure and use it as a template to fill your resume. You can also import a .json file or a PDF previously exported from Resumify.',
    prompting: 'View JSON structure',
    clearAll: 'Clear All',
    clearConfirm: 'Are you sure you want to clear all your resume data?',
    saveLocal: 'Save to Browser',
    loadLocal: 'My Saved Resumes',
    savedResumes: 'Locally Saved Resumes',
    noSavedResumes: 'No saved resumes found.',
    saveVersionName: 'Resume Name (e.g., Data Scientist v2)',
    load: 'Load',
    delete: 'Delete',
    versionSaved: 'Resume Saved!',

    // Resume Sections
    summary: 'Summary',
    education: 'Education',
    experience: 'Experience',
    projects: 'Projects',
    certifications: 'Certifications',
    skills: 'Skills',
    technicalSkills: 'Technical Skills',
    languages: 'Languages',
    certLink: 'View Certification',

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
    cancel: 'Cancel',
    save: 'Save',
    show: 'Show section',
    hide: 'Hide section',
    deleteConfirm: 'Are you sure you want to delete this?',

    // Education
    institution: 'University / School',
    companyOrg: 'Company / Organization',
    degree: 'Degree / Major',
    startDate: 'Start Date',
    endDate: 'End Date',
    currentStudy: 'Currently studying',
    gpa: 'GPA / Honors (Optional)',

    // Experience
    company: 'Company',
    role: 'Role / Title',
    linkOptional: 'Link (Optional)',
    descriptionAchievements: 'Description (Achievements)',
    describeAchievement: '• Describe an achievement...',
    addAchievement: '+ Add Achievement',
    bulletsDescription: 'Description (Bullet Points)',
    describeBullet: '• Write a detail or achievement...',
    addBullet: '+ Add Bullet',

    // Projects
    projectName: 'Project Name',
    techSubtitle: 'Technologies',
    dates: 'Dates',
    linkText: 'Link',
    addDetail: '+ Add Detail',

    // Certifications
    certName: 'Certification Name',
    issuer: 'Issuer / Organization',
    date: 'Date',
    linkIdOptional: 'Link / Credential ID (Optional)',

    // Skills
    category: 'Category',
    catPlace: 'e.g. Languages, Tools, Frameworks',
    itemsList: 'Items',
    itemsPlace: 'e.g. Spanish, English, French',

    // Technical Skills
    techCatPlace: 'e.g. Technologies, Tools, Frameworks',
    techItemsPlace: 'e.g. JavaScript, TypeScript, React, Docker',

    // Languages
    langCatPlace: 'e.g. Languages (optional)',
    langItemsPlace: 'e.g. Spanish [Native], English [Intermediate]',

    // Workshops
    workshops: 'Workshops / Conferences',
    workshopName: 'Workshop / Conference Name',
    organizer: 'Organizer / Institution',
    addWorkshop: '+ Add Workshop/Conference',

    // Links
    links: 'Links',
    linkLabel: 'Link Title',
    linkUrl: 'Link URL',
    addLink: '+ Add Link',
    subtitles: 'Subtitle',
    addSubtitle: '+ Add Subtitle',

    // Other
    present: 'Present',
    pdfError: 'The PDF library did not load. Please refresh the page.',
    jsonError: 'Error reading the file. Make sure the format is correct.',
  },
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
    const systemLang = navigator.language.split('-')[0];
    if (systemLang === 'en') setLang('en');
  }, []);

  const toggleLanguage = () => setLang(prev => (prev === 'es' ? 'en' : 'es'));

  const t = (key: string): string => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
