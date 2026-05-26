
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
    summary: string;
  };
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  workshops?: WorkshopItem[];
  links?: LinkItem[];
  font?: string;
}

export interface SkillItem {
  id: string;
  category: string;
  items: string;
  bullets?: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpaOrHonors: string;
  bullets?: string[];
  subtitles?: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  link?: string;
  subtitles?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  technologies: string;
  description: string[];
  link?: string;
  date?: string;
  location?: string;
  subtitles?: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
  bullets?: string[];
}

export interface WorkshopItem {
  id: string;
  name: string;
  organizer: string;
  date: string;
  location?: string;
  link?: string;
  bullets?: string[];
  subtitles?: string[];
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export enum SectionType {
  EDUCATION = 'education',
  EXPERIENCE = 'experience',
  PROJECTS = 'projects',
  SKILLS = 'skills',
  CERTIFICATIONS = 'certifications',
  WORKSHOPS = 'workshops',
  LINKS = 'links'
}
