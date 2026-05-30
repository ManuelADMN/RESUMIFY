
import { ResumeData } from './types';

export const INITIAL_RESUME_DATA: ResumeData = {
  sectionOrder: ['technicalSkills', 'education', 'experience', 'projects', 'certifications', 'skills', 'languages', 'workshops', 'links'],
  hiddenSections: [],
  personalInfo: {
    fullName: "Juan Pérez",
    email: "juan@denoise.cl",
    phone: "+56 9 1234 5678",
    linkedin: "linkedin.com/in/juanperez",
    github: "github.com/juanperez",
    location: "Puerto Varas, Chile",
    website: "juanperez.dev",
    summary: "Ingeniero de Software apasionado con más de 3 años de experiencia en el desarrollo de aplicaciones web escalables. Especializado en el stack MERN y metodologías ágiles, con un fuerte enfoque en la calidad del código y la experiencia del usuario. Busco oportunidades para aportar soluciones innovadoras en un entorno colaborativo."
  },
  education: [
    {
      id: "edu-1",
      institution: "Duoc UC Sede Puerto Montt",
      degree: "Ingeniería en Informática",
      location: "Puerto Montt, Chile",
      startDate: "Marzo 2018",
      endDate: "Diciembre 2022",
      gpaOrHonors: "Aprobado con Distinción"
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Tech Solutions Sur",
      role: "Desarrollador Full Stack",
      location: "Puerto Varas, Chile",
      startDate: "Ene 2023",
      endDate: "Presente",
      link: "techsolutions.cl",
      bullets: [
        "Desarrollé y mantuve múltiples aplicaciones web utilizando React y Node.js, mejorando la eficiencia operativa de clientes locales en un 30%.",
        "Implementé pipelines de CI/CD con GitHub Actions, reduciendo el tiempo de despliegue en un 40%.",
        "Colaboré estrechamente con equipos multidisciplinarios para diseñar arquitecturas de software robustas y escalables."
      ]
    },
    {
      id: "exp-2",
      company: "Innovación Los Lagos",
      role: "Desarrollador Junior",
      location: "Puerto Montt, Chile",
      startDate: "Ene 2022",
      endDate: "Dic 2022",
      link: "",
      bullets: [
        "Participé en la migración de sistemas legacy a arquitecturas modernas basadas en microservicios.",
        "Optimicé consultas SQL complejas, logrando una reducción del 50% en los tiempos de carga de reportes críticos."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "Sistema de Gestión de Inventario",
      technologies: "React, Firebase, Tailwind CSS",
      description: [
        "Aplicación web para el control de stock en tiempo real para pymes locales.",
        "Implementación de autenticación segura y roles de usuario."
      ],
      link: "github.com/juanperez/inventario",
      date: "Jun 2023"
    },
    {
      id: "proj-2",
      name: "Dashboard de Analítica Turística",
      technologies: "Python, Streamlit, Pandas",
      description: [
        "Herramienta de visualización de datos para analizar tendencias turísticas en la región de Los Lagos.",
        "Integración con APIs públicas para obtener datos meteorológicos y de ocupación hotelera."
      ],
      link: "",
      date: "Nov 2022"
    }
  ],
  technicalSkills: [
    {
      id: "tskill-1",
      category: "Tecnologías",
      items: "JavaScript, TypeScript, React, Node.js, Python, SQL, HTML5, CSS3"
    },
    {
      id: "tskill-2",
      category: "Herramientas",
      items: "Git, Docker, VS Code, Figma, Jira"
    }
  ],
  languages: [
    {
      id: "lang-1",
      category: "Idiomas",
      items: "Español [Nativo], Inglés [Intermedio]"
    }
  ],
  skills: [
    {
      id: "skill-4",
      category: "Habilidades Blandas",
      items: "Trabajo en equipo, Resolución de problemas, Comunicación efectiva, Adaptabilidad"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "Ago 2023",
      link: "aws.amazon.com/verification"
    },
    {
      id: "cert-2",
      name: "Scrum Master Certified (SMC)",
      issuer: "Scrum Alliance",
      date: "Mar 2023",
      link: ""
    }
  ],
  workshops: [
    {
      id: "ws-1",
      name: "Taller de React 19 y Next.js",
      organizer: "Denoise Academy",
      date: "Nov 2024",
      location: "",
      link: "denoise.cl/workshops",
      bullets: [
        "Aprendí patrones avanzados de React como Server Actions y Server Components.",
        "Desarrollé una aplicación completa en producción utilizando Next.js App Router."
      ]
    }
  ],
  links: [
    {
      id: "link-1",
      label: "Portafolio Personal",
      url: "juanperez.dev"
    },
    {
      id: "link-2",
      label: "LinkedIn Profesional",
      url: "linkedin.com/in/juanperez"
    }
  ],
  font: "Arial"
};

export const EMPTY_RESUME_DATA: ResumeData = {
  sectionOrder: ['technicalSkills', 'education', 'experience', 'projects', 'certifications', 'skills', 'languages', 'workshops', 'links'],
  hiddenSections: [],
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    summary: ""
  },
  education: [],
  experience: [],
  projects: [],
  technicalSkills: [],
  languages: [],
  skills: [],
  certifications: [],
  workshops: [],
  links: [],
  font: "Arial"
};