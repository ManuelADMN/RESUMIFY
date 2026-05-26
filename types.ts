
export interface ResumeData {
  sectionOrder?: string[];
  hiddenSections?: string[];
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
    website: string;
    summary: string; // Added summary field
  };
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certifications: CertificationItem[]; // Added certifications
}

export interface SkillItem {
  id: string;
  category: string;
  items: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpaOrHonors: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  link?: string; // For "Company | Link" format
}

export interface ProjectItem {
  id: string;
  name: string;
  technologies: string;
  description: string[];
  link?: string;
  date?: string; // Added date for projects
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export enum SectionType {
  EDUCATION = 'Educación',
  EXPERIENCE = 'Experiencia',
  PROJECTS = 'Proyectos',
  SKILLS = 'Habilidades',
  CERTIFICATIONS = 'Certificaciones'
}