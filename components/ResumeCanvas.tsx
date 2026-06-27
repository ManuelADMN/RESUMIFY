import React from 'react';
import { ResumeData, SkillItem, WorkshopItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import {
  DEFAULT_SECTION_ORDER, formatATSDate, normalizeATSInline,
} from '../utils/atsResume';

interface ResumeCanvasProps {
  data: ResumeData;
}

const SplitRow: React.FC<{ left: React.ReactNode; right: React.ReactNode }> = ({ left, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
    <div style={{ textAlign: 'left' }}>{left}</div>
    <div style={{ textAlign: 'right', whiteSpace: 'nowrap', marginLeft: '16px', flexShrink: 0 }}>{right}</div>
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ width: '100%', marginBottom: '5px', marginTop: '14px' }}>
    <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.5px solid black', paddingBottom: '2px', marginBottom: '2px', color: 'black' }}>
      {title}
    </h2>
  </div>
);

/**
 * Groups a section header with its first item so html2pdf never orphans
 * the header at the bottom of a page without content following it.
 */
const SectionHeaderGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="section-header-group break-inside-avoid page-break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
    <SectionHeader title={title} />
    {children}
  </div>
);

const ResumeCanvas: React.FC<ResumeCanvasProps> = ({ data }) => {
  const { t } = useLanguage();

  const isUrl = (text: string) =>
    text.startsWith('http') || text.startsWith('www') || text.includes('.com') || text.includes('.cl') || text.includes('.dev');

  const formatUrl = (text: string) => {
    if (text.startsWith('www')) return `https://${text}`;
    if (!text.startsWith('http')) return `https://${text}`;
    return text;
  };

  const DateSpan: React.FC<{ start?: string; end?: string; date?: string }> = ({ start, end, date }) => (
    <span style={{ color: '#666666', fontSize: '9pt', whiteSpace: 'nowrap' }}>
      {formatATSDate(start, end, date)}
    </span>
  );

  /**
   * Border-bottom is used instead of text-decoration because html2canvas
   * renders border-bottom as part of the box model (guaranteed tight),
   * while text-underline-offset can mis-render in PDF exports.
   */
  const InlineLink: React.FC<{ href: string }> = ({ href }) => (
    <a href={formatUrl(href)} target="_blank" rel="noreferrer"
      style={{ color: 'inherit', textDecoration: 'none' }}>
      <span style={{ borderBottom: '0.5px solid currentColor', lineHeight: 1 }}>
        {normalizeATSInline(href)}
      </span>
    </a>
  );

  const SubtitleRow: React.FC<{ items: (string | undefined)[] }> = ({ items }) => {
    const valid = items.map(normalizeATSInline).filter(Boolean) as string[];
    if (valid.length === 0) return null;
    return (
      <div style={{ fontSize: '9.5pt', color: '#6b7280', marginTop: '2px', lineHeight: 1.3 }}>
        {valid.join(' · ')}
      </div>
    );
  };

  const BulletList: React.FC<{ items: string[] }> = ({ items }) => {
    if (!items || items.length === 0) return null;
    return (
      <ul style={{ marginTop: '4px', paddingLeft: '18px', listStyleType: 'disc' }}>
        {items.map((b, i) => (
          <li key={i} style={{ fontSize: '9.5pt', color: 'black', lineHeight: 1.35, marginBottom: '1px' }}>{b}</li>
        ))}
      </ul>
    );
  };

  const getFontFamily = (fontName: string) => {
    switch (fontName) {
      case 'Arial': return 'Arial, Helvetica, sans-serif';
      case 'Calibri': return 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif';
      case 'Helvetica': return 'Helvetica, Arial, sans-serif';
      case 'Times New Roman': return '"Times New Roman", Times, serif';
      default: return 'Arial, Helvetica, sans-serif';
    }
  };

  const sectionOrder = data.sectionOrder?.length ? data.sectionOrder : DEFAULT_SECTION_ORDER;
  const hiddenSections = data.hiddenSections || [];
  const contactItems = [
    data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location,
    data.personalInfo.linkedin, data.personalInfo.github, data.personalInfo.website,
  ].map(normalizeATSInline).filter(Boolean);

  return (
    <div
      id="resume-canvas"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '12mm 12mm 14mm 12mm',
        boxSizing: 'border-box',
        fontSize: '10pt',
        lineHeight: 1.1,
        backgroundColor: 'white',
        color: 'black',
        fontFamily: getFontFamily(data.font || 'Arial'),
      }}
    >
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontWeight: 'bold', marginBottom: '10px', color: 'black', fontSize: '22pt', lineHeight: 1.05 }}>
          {normalizeATSInline(data.personalInfo.fullName)}
        </h1>
        <div style={{ fontSize: '9pt', textAlign: 'center', lineHeight: 1.35 }}>
          {contactItems.join(' | ')}
        </div>
      </header>

      {/* Divider */}
      <div style={{ width: '100%', height: '3px', backgroundColor: 'black', margin: '10px 0 14px' }} />

      {/* Summary */}
      <div className="section-header-group break-inside-avoid page-break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
        <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: 'black' }}>
          {t('summary')}
        </h2>
        <p style={{ color: 'black', lineHeight: 1.35, margin: 0 }}>
          {normalizeATSInline(data.personalInfo.summary)}
        </p>
      </div>

      {sectionOrder.map(sectionId => {
        if (hiddenSections.includes(sectionId)) return null;

        switch (sectionId) {

          case 'technicalSkills': {
            if (!data.technicalSkills || data.technicalSkills.length === 0) return null;
            const renderTechSkill = (skill: SkillItem) => (
              <div style={{ marginBottom: '5px' }}>
                {skill.category && (
                  <div style={{ fontWeight: 'bold', fontSize: '10pt', lineHeight: 1.2 }}>{skill.category}</div>
                )}
                <div style={{ fontSize: '9.5pt', lineHeight: 1.35, color: '#111111' }}>{skill.items}</div>
              </div>
            );
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('technicalSkills')}>
                  {renderTechSkill(data.technicalSkills[0])}
                </SectionHeaderGroup>
                {data.technicalSkills.slice(1).map((skill) => (
                  <div key={skill.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {renderTechSkill(skill)}
                  </div>
                ))}
              </section>
            );
          }

          case 'languages': {
            if (!data.languages || data.languages.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('languages')}>
                  <div>
                    {data.languages.map((lang_item) => (
                      <div key={lang_item.id} style={{ marginBottom: '3px' }}>
                        {lang_item.category && (
                          <div style={{ fontWeight: 'bold', fontSize: '10pt', lineHeight: 1.2 }}>{lang_item.category}</div>
                        )}
                        <div style={{ fontSize: '9.5pt', lineHeight: 1.35 }}>{lang_item.items}</div>
                      </div>
                    ))}
                  </div>
                </SectionHeaderGroup>
              </section>
            );
          }

          case 'education': {
            if (data.education.length === 0) return null;
            const renderEdu = (edu: typeof data.education[0]) => {
              const subs = [edu.degree, edu.gpaOrHonors, ...(edu.subtitles || []), edu.location].filter(Boolean) as string[];
              return (
                <>
                  <SplitRow
                    left={<span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{edu.institution}</span>}
                    right={<DateSpan start={edu.startDate} end={edu.endDate} />}
                  />
                  <SubtitleRow items={subs} />
                  <BulletList items={edu.bullets || []} />
                </>
              );
            };
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('education')}>
                  {renderEdu(data.education[0])}
                </SectionHeaderGroup>
                {data.education.slice(1).map((edu) => (
                  <div key={edu.id} className="break-inside-avoid" style={{ marginTop: '8px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {renderEdu(edu)}
                  </div>
                ))}
              </section>
            );
          }

          case 'experience': {
            if (data.experience.length === 0) return null;
            const renderExp = (exp: typeof data.experience[0]) => {
              const subs = [exp.role, ...(exp.subtitles || []), exp.location].filter(Boolean) as string[];
              return (
                <>
                  <SplitRow
                    left={
                      <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>
                        {exp.company}
                        {exp.link && (
                          <span style={{ fontWeight: 'normal', marginLeft: '4px' }}>
                            |{' '}{isUrl(exp.link) ? <InlineLink href={exp.link} /> : <span>{exp.link}</span>}
                          </span>
                        )}
                      </span>
                    }
                    right={<DateSpan start={exp.startDate} end={exp.endDate} />}
                  />
                  <SubtitleRow items={subs} />
                  <BulletList items={exp.bullets || []} />
                </>
              );
            };
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('experience')}>
                  {renderExp(data.experience[0])}
                </SectionHeaderGroup>
                {data.experience.slice(1).map((exp) => (
                  <div key={exp.id} className="break-inside-avoid" style={{ marginTop: '10px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {renderExp(exp)}
                  </div>
                ))}
              </section>
            );
          }

          case 'projects': {
            if (data.projects.length === 0) return null;
            const renderProj = (proj: typeof data.projects[0]) => {
              const subs = [...(proj.subtitles || []), proj.technologies, proj.location].filter(Boolean) as string[];
              return (
                <>
                  <SplitRow
                    left={
                      <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>
                        {proj.name}
                        {proj.link && (
                          <span style={{ fontWeight: 'normal', marginLeft: '4px' }}>
                            |{' '}{isUrl(proj.link) ? <InlineLink href={proj.link} /> : <span>{proj.link}</span>}
                          </span>
                        )}
                      </span>
                    }
                    right={<DateSpan start={proj.startDate} end={proj.endDate} date={proj.date} />}
                  />
                  <SubtitleRow items={subs} />
                  <BulletList items={proj.description || []} />
                </>
              );
            };
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('projects')}>
                  {renderProj(data.projects[0])}
                </SectionHeaderGroup>
                {data.projects.slice(1).map((proj) => (
                  <div key={proj.id} className="break-inside-avoid" style={{ marginTop: '8px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {renderProj(proj)}
                  </div>
                ))}
              </section>
            );
          }

          case 'certifications': {
            if (!data.certifications || data.certifications.length === 0) return null;
            const renderCert = (cert: typeof data.certifications[0]) => (
              <>
                <SplitRow
                  left={<span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{cert.name}</span>}
                  right={<DateSpan start={cert.startDate} end={cert.endDate} date={cert.date} />}
                />
                <SubtitleRow items={[cert.issuer, cert.link]} />
                <BulletList items={cert.bullets || []} />
              </>
            );
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('certifications')}>
                  {renderCert(data.certifications[0])}
                </SectionHeaderGroup>
                {data.certifications.slice(1).map((cert) => (
                  <div key={cert.id} className="break-inside-avoid" style={{ marginTop: '8px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {renderCert(cert)}
                  </div>
                ))}
              </section>
            );
          }

          case 'skills': {
            if (data.skills.length === 0) return null;
            const renderSkill = (skill: SkillItem) => (
              <div style={{ marginBottom: '5px' }}>
                {skill.category && (
                  <div style={{ fontWeight: 'bold', fontSize: '10pt', lineHeight: 1.2 }}>{skill.category}</div>
                )}
                <div style={{ fontSize: '9.5pt', lineHeight: 1.35, color: '#111111' }}>{skill.items}</div>
                <BulletList items={skill.bullets || []} />
              </div>
            );
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('skills')}>
                  {renderSkill(data.skills[0])}
                </SectionHeaderGroup>
                {data.skills.slice(1).map((skill) => (
                  <div key={skill.id} className="break-inside-avoid" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {renderSkill(skill)}
                  </div>
                ))}
              </section>
            );
          }

          case 'workshops': {
            if (!data.workshops || data.workshops.length === 0) return null;
            const renderWs = (ws: WorkshopItem) => {
              const subs = [ws.organizer, ...(ws.subtitles || []), (ws.location && !/^\s*(remoto|remote)\s*$/i.test(ws.location) ? ws.location : '')].filter(Boolean) as string[];
              return (
                <>
                  <SplitRow
                    left={
                      <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>
                        {ws.name}
                        {ws.link && (
                          <span style={{ fontWeight: 'normal', marginLeft: '4px' }}>
                            |{' '}{isUrl(ws.link) ? <InlineLink href={ws.link} /> : <span>{ws.link}</span>}
                          </span>
                        )}
                      </span>
                    }
                    right={<DateSpan start={ws.startDate} end={ws.endDate} date={ws.date} />}
                  />
                  <SubtitleRow items={subs} />
                  <BulletList items={ws.bullets || []} />
                </>
              );
            };
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('workshops')}>
                  {renderWs(data.workshops![0])}
                </SectionHeaderGroup>
                {data.workshops!.slice(1).map((ws) => (
                  <div key={ws.id} className="break-inside-avoid" style={{ marginTop: '8px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    {renderWs(ws)}
                  </div>
                ))}
              </section>
            );
          }

          case 'links': {
            if (!data.links || data.links.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeaderGroup title={t('links')}>
                  {data.links[0] && (
                    <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{data.links[0].label}</span>
                      {data.links[0].url && (
                        <div style={{ fontSize: '9.5pt' }}>
                          <a href={formatUrl(data.links[0].url)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            {data.links[0].url}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </SectionHeaderGroup>
                {data.links.slice(1).map((link) => (
                  <div key={link.id} className="break-inside-avoid page-break-inside-avoid" style={{ marginTop: '6px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '11pt' }}>{link.label}</span>
                    {link.url && (
                      <div style={{ fontSize: '9.5pt' }}>
                        <a href={formatUrl(link.url)} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                          {link.url}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};

export default ResumeCanvas;
