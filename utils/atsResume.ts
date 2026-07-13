import { ResumeData } from '../types';

export const DEFAULT_SECTION_ORDER = [
  'technicalSkills', 'education', 'experience', 'projects',
  'certifications', 'skills', 'languages', 'workshops', 'links',
];

const LABELS: Record<string, Record<string, string>> = {
  es: {
    summary: 'Resumen', education: 'Educación', experience: 'Experiencia',
    projects: 'Proyectos', certifications: 'Certificaciones', skills: 'Habilidades',
    technicalSkills: 'Habilidades Técnicas', languages: 'Idiomas',
    workshops: 'Talleres y Conferencias', links: 'Enlaces',
  },
  en: {
    summary: 'Summary', education: 'Education', experience: 'Experience',
    projects: 'Projects', certifications: 'Certifications', skills: 'Skills',
    technicalSkills: 'Technical Skills', languages: 'Languages',
    workshops: 'Workshops and Conferences', links: 'Links',
  },
};

export const getATSLabel = (key: string, lang: string) =>
  LABELS[lang]?.[key] ?? LABELS.en[key] ?? key;

/** Removes invisible hyphens and whitespace that can corrupt a PDF text layer. */
export const normalizeATSInline = (value?: string | null) =>
  String(value ?? '')
    .replace(/[\u00AD\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const formatATSDate = (start?: string, end?: string, legacyDate?: string) => {
  const range = [normalizeATSInline(start), normalizeATSInline(end)].filter(Boolean).join(' - ');
  return range || normalizeATSInline(legacyDate);
};

const addLine = (lines: string[], value?: string | null) => {
  const clean = normalizeATSInline(value);
  if (clean) lines.push(clean);
};

const addBullets = (lines: string[], bullets?: string[]) => {
  bullets?.forEach(bullet => {
    const clean = normalizeATSInline(bullet);
    if (clean) lines.push(`• ${clean}`);
  });
};

/**
 * Canonical reading order used to audit exports independently of their layout.
 * This is deliberately plain text: it approximates what an ATS should receive.
 */
export const buildATSPlainText = (data: ResumeData, lang: string) => {
  const lines: string[] = [];
  addLine(lines, data.personalInfo.fullName);
  addLine(lines, [
    data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location,
    data.personalInfo.linkedin, data.personalInfo.github, data.personalInfo.website,
  ].map(normalizeATSInline).filter(Boolean).join(' | '));

  if (normalizeATSInline(data.personalInfo.summary)) {
    lines.push(getATSLabel('summary', lang).toUpperCase());
    addLine(lines, data.personalInfo.summary);
  }

  const order = data.sectionOrder?.length ? data.sectionOrder : DEFAULT_SECTION_ORDER;
  const hidden = data.hiddenSections ?? [];

  order.forEach(section => {
    if (hidden.includes(section)) return;

    const heading = () => lines.push(getATSLabel(section, lang).toUpperCase());
    switch (section) {
      case 'technicalSkills':
      case 'skills':
      case 'languages': {
        const items = section === 'technicalSkills'
          ? data.technicalSkills ?? []
          : section === 'languages' ? data.languages ?? [] : data.skills ?? [];
        if (!items.length) return;
        heading();
        items.forEach(item => {
          addLine(lines, [item.category, item.items].map(normalizeATSInline).filter(Boolean).join(': '));
          addBullets(lines, item.bullets);
        });
        return;
      }
      case 'education':
        if (!data.education.length) return;
        heading();
        data.education.forEach(item => {
          addLine(lines, item.institution);
          addLine(lines, [item.degree, item.gpaOrHonors, ...(item.subtitles ?? []), item.location]
            .map(normalizeATSInline).filter(Boolean).join(' | '));
          addLine(lines, formatATSDate(item.startDate, item.endDate));
          addBullets(lines, item.bullets);
        });
        return;
      case 'experience':
        if (!data.experience.length) return;
        heading();
        data.experience.forEach(item => {
          addLine(lines, item.company);
          addLine(lines, [item.role, item.location, formatATSDate(item.startDate, item.endDate), item.link]
            .map(normalizeATSInline).filter(Boolean).join(' | '));
          addBullets(lines, item.bullets);
        });
        return;
      case 'projects':
        if (!data.projects.length) return;
        heading();
        data.projects.forEach(item => {
          addLine(lines, item.name);
          addLine(lines, [item.technologies, item.location, formatATSDate(item.startDate, item.endDate, item.date), item.link]
            .map(normalizeATSInline).filter(Boolean).join(' | '));
          addLine(lines, (item.subtitles ?? []).join(' | '));
          addBullets(lines, item.description);
        });
        return;
      case 'certifications': {
        const items = data.certifications ?? [];
        if (!items.length) return;
        heading();
        items.forEach(item => {
          addLine(lines, item.name);
          addLine(lines, [item.issuer, formatATSDate(item.startDate, item.endDate, item.date), item.link]
            .map(normalizeATSInline).filter(Boolean).join(' | '));
          addBullets(lines, item.bullets);
        });
        return;
      }
      case 'workshops': {
        const items = data.workshops ?? [];
        if (!items.length) return;
        heading();
        items.forEach(item => {
          addLine(lines, item.name);
          addLine(lines, [item.organizer, item.location, formatATSDate(item.startDate, item.endDate, item.date), item.link]
            .map(normalizeATSInline).filter(Boolean).join(' | '));
          addLine(lines, (item.subtitles ?? []).join(' | '));
          addBullets(lines, item.bullets);
        });
        return;
      }
      case 'links': {
        const items = data.links ?? [];
        if (!items.length) return;
        heading();
        items.forEach(item => addLine(lines, `${normalizeATSInline(item.label)}: ${normalizeATSInline(item.url)}`));
      }
    }
  });

  return lines.join('\n');
};

