import React from 'react';
import { ResumeData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ResumeCanvasProps {
  data: ResumeData;
}

// Helper for the "Left Content --- Right Content" layout common in the PDF
const SplitRow: React.FC<{ left: React.ReactNode; right: React.ReactNode; className?: string }> = ({ left, right, className = "" }) => (
  <div className={`flex justify-between items-baseline w-full ${className}`}>
    <div className="text-left">{left}</div>
    <div className="text-right whitespace-nowrap ml-4 shrink-0">{right}</div>
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <div className="w-full mb-3 mt-8 break-after-avoid">
    <h2 className="text-[16px] font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 text-black" style={{ borderBottomWidth: '0.5px' }}>
      {title}
    </h2>
  </div>
);

// Styled middle dot divider with spaced proportions before and after
const CenteredDivider: React.FC = () => (
  <span className="mx-2.5 text-gray-400 select-none font-normal" style={{ fontSize: '10pt', verticalAlign: 'middle' }}>&middot;</span>
);

const ResumeCanvas: React.FC<ResumeCanvasProps> = ({ data }) => {
  const { t } = useLanguage();

  const isUrl = (text: string) => {
    return text.startsWith('http') || text.startsWith('www') || text.includes('.com') || text.includes('.cl') || text.includes('.dev');
  };

  const formatUrl = (text: string) => {
    if (text.startsWith('www')) return `https://${text}`;
    if (!text.startsWith('http')) return `https://${text}`;
    return text;
  };

  const formatContactLink = (field: 'linkedin' | 'github' | 'website', value: string) => {
    const cleanValue = value.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/^www\./, '');
    
    if (field === 'linkedin') {
      const username = cleanValue.replace(/^linkedin\.com\/in\//, '').replace(/^\/in\//, '').replace(/^@/, '');
      return {
        href: `https://linkedin.com/in/${username}`,
        label: `linkedin.com/in/${username}`
      };
    }
    
    if (field === 'github') {
      const username = cleanValue.replace(/^github\.com\//, '').replace(/^@/, '');
      return {
        href: `https://github.com/${username}`,
        label: `github.com/${username}`
      };
    }
    
    if (field === 'website') {
      return {
        href: value.startsWith('http') ? value : `https://${value}`,
        label: cleanValue
      };
    }
    
    return { href: value, label: value };
  };

  const DateSpan: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-[#666666] text-[9pt]">{children}</span>
  );

  const getFontFamily = (fontName: string) => {
    switch (fontName) {
      case 'EB Garamond': return "'EB Garamond', serif";
      case 'Lora': return "'Lora', serif";
      case 'Outfit': return "'Outfit', sans-serif";
      case 'Inter': return "'Inter', sans-serif";
      case 'Playfair Display': return "'Playfair Display', serif";
      case 'JetBrains Mono': return "'JetBrains Mono', monospace";
      case 'Arial': return "Arial, Helvetica, sans-serif";
      case 'Calibri': return 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif';
      case 'Georgia': return "Georgia, serif";
      case 'Times New Roman': return '"Times New Roman", Times, serif';
      case 'Merriweather':
      default:
        return "'Merriweather', serif";
    }
  };

  return (
    <div 
      id="resume-canvas"
      className="resume-page bg-white mx-auto text-black leading-snug print:w-full print:h-full print:absolute print:top-0 print:left-0"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '12mm 12mm', 
        boxSizing: 'border-box',
        fontSize: '10.5pt',
        backgroundColor: 'white',
        fontFamily: getFontFamily(data.font || 'Merriweather')
      }}
    >
      {/* Header */}
      <header className="text-center mb-2">
        <h1 className="text-4xl font-bold mb-3 text-black tracking-tight">
          {data.personalInfo.fullName}
        </h1>
        <div className="text-[9pt] flex flex-wrap justify-center gap-x-1 text-black items-center">
            {data.personalInfo.email && (
                <>
                <a href={`mailto:${data.personalInfo.email}`} className="hover:underline">{data.personalInfo.email}</a>
                </>
            )}
            {data.personalInfo.phone && (
                <>
                <span className="mx-1">|</span>
                <span>{data.personalInfo.phone}</span>
                </>
            )}
            {data.personalInfo.location && (
                <>
                <span className="mx-1">|</span>
                <span>{data.personalInfo.location}</span>
                </>
            )}
            {data.personalInfo.linkedin && (() => {
                const linkInfo = formatContactLink('linkedin', data.personalInfo.linkedin);
                return (
                  <>
                  <span className="mx-1">|</span>
                  <a href={linkInfo.href} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>
                  </>
                );
            })()}
            {data.personalInfo.github && (() => {
                const linkInfo = formatContactLink('github', data.personalInfo.github);
                return (
                  <>
                  <span className="mx-1">|</span>
                  <a href={linkInfo.href} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
                  </>
                );
            })()}
            {data.personalInfo.website && (() => {
                const linkInfo = formatContactLink('website', data.personalInfo.website);
                return (
                  <>
                  <span className="mx-1">|</span>
                  <a href={linkInfo.href} target="_blank" rel="noreferrer" className="hover:underline">
                    {lang === 'es' ? 'Sitio Web' : 'Website'}
                  </a>
                  </>
                );
            })()}
        </div>
      </header>

      {/* Thick Asymmetrical Line above Summary */}
      <div className="w-full h-[3px] bg-black mb-6 mt-4 print:bg-black"></div>

      {/* Summary (Resumen) */}
      <section>
          <h2 className="text-[16px] font-bold uppercase tracking-wide mb-2 text-black">
            {t('summary')}
          </h2>
          <p className="text-justify text-black whitespace-pre-wrap">
              {data.personalInfo.summary}
          </p>
      </section>

      {(data.sectionOrder || ['education', 'experience', 'projects', 'certifications', 'skills', 'workshops', 'links']).map(sectionId => {
        if ((data.hiddenSections || []).includes(sectionId)) return null;
        switch (sectionId) {
          case 'education':
            if (data.education.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('education')} />
                <div className="space-y-3">
                  {data.education.map((edu) => {
                    const eduSubtitles = edu.subtitles && edu.subtitles.length > 0
                      ? edu.subtitles
                      : [edu.degree, edu.location, edu.gpaOrHonors].filter(Boolean);
                    return (
                      <div key={edu.id} className="break-inside-avoid">
                        <SplitRow 
                            left={<span className="font-bold text-[11pt]">{edu.institution}</span>} 
                            right={<DateSpan>{edu.startDate} - {edu.endDate}</DateSpan>} 
                        />
                        {eduSubtitles.length > 0 && (
                          <div className="text-[9.5pt] text-gray-500 mt-0.5 flex flex-wrap items-center">
                            {eduSubtitles.map((sub, sIdx) => (
                              <React.Fragment key={sIdx}>
                                {sIdx > 0 && <CenteredDivider />}
                                <span>{sub}</span>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                        {edu.bullets && edu.bullets.length > 0 && (
                          <div className="mt-1.5 space-y-1 pl-0">
                            {edu.bullets.map((bullet, idx) => (
                              <p key={idx} className="text-justify text-[9.5pt] text-black leading-relaxed">
                                {bullet}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          
          case 'experience':
            if (data.experience.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('experience')} />
                <div className="space-y-4">
                  {data.experience.map((exp) => {
                    const expSubtitles = exp.subtitles && exp.subtitles.length > 0
                      ? exp.subtitles
                      : [exp.role, exp.location].filter(Boolean);
                    return (
                      <div key={exp.id} className="break-inside-avoid">
                        <SplitRow 
                            left={
                                <span className="font-bold text-[11pt]">
                                    {exp.company} 
                                    {exp.link && (
                                        <span className="font-normal underline decoration-1 underline-offset-2 ml-1">
                                            | {exp.link}
                                        </span>
                                    )}
                                </span>
                            } 
                            right={<DateSpan>{exp.startDate} - {exp.endDate}</DateSpan>} 
                        />
                        {expSubtitles.length > 0 && (
                          <div className="text-[9.5pt] text-gray-500 mt-0.5 flex flex-wrap items-center">
                            {expSubtitles.map((sub, sIdx) => (
                              <React.Fragment key={sIdx}>
                                {sIdx > 0 && <CenteredDivider />}
                                <span className="italic">{sub}</span>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                        {exp.bullets && exp.bullets.length > 0 && (
                          <div className="mt-1.5 space-y-1 pl-0">
                            {exp.bullets.map((bullet, idx) => (
                              <p key={idx} className="text-justify text-[9.5pt] text-black leading-relaxed">
                                {bullet}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );

          case 'projects':
            if (data.projects.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('projects')} />
                <div className="space-y-3">
                  {data.projects.map((proj) => {
                    const projSubtitles = proj.subtitles && proj.subtitles.length > 0
                      ? proj.subtitles
                      : [proj.technologies].filter(Boolean);
                    return (
                      <div key={proj.id} className="break-inside-avoid">
                         <SplitRow 
                            left={
                                <span className="font-bold text-[11pt]">
                                    {proj.name} 
                                    {proj.link && (
                                        <span className="font-normal underline decoration-1 underline-offset-2 ml-1">
                                            | {proj.link}
                                        </span>
                                    )}
                                </span>
                            } 
                            right={<DateSpan>{proj.date}</DateSpan>} 
                        />
                        {projSubtitles.length > 0 && (
                          <div className="text-[9.5pt] text-gray-500 mt-0.5 mb-1 flex flex-wrap items-center">
                            {projSubtitles.map((sub, sIdx) => (
                              <React.Fragment key={sIdx}>
                                {sIdx > 0 && <CenteredDivider />}
                                <span className="italic">{sub}</span>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                        {proj.description && proj.description.length > 0 && (
                          <div className="mt-1 space-y-1.5 pl-0">
                            {proj.description.map((desc, idx) => (
                              <p key={idx} className="text-justify text-[9.5pt] text-black leading-relaxed">
                                {desc}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );

          case 'certifications':
            if (!data.certifications || data.certifications.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('certifications')} />
                <div className="space-y-3">
                   {data.certifications.map((cert) => (
                     <div key={cert.id} className="break-inside-avoid">
                        <SplitRow 
                          left={
                              <span className="font-bold text-[11pt]">
                                 {cert.name}
                              </span>
                          }
                          right={<DateSpan>{cert.date}</DateSpan>}
                        />
                        {(cert.issuer || cert.link) && (
                          <div className="text-[9.5pt] text-gray-500 mt-0.5 mb-1 flex flex-wrap items-center">
                            {cert.issuer && <span>{cert.issuer}</span>}
                            {cert.issuer && cert.link && <CenteredDivider />}
                            {cert.link && (
                              isUrl(cert.link) ? (
                                <a 
                                  href={formatUrl(cert.link)} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="underline decoration-1 underline-offset-2 hover:text-blue-600"
                                >
                                  {t('certLink')}
                                </a>
                              ) : (
                                <span>{cert.link}</span>
                              )
                            )}
                          </div>
                        )}
                        {cert.bullets && cert.bullets.length > 0 && (
                          <div className="mt-1.5 space-y-1.5 pl-0">
                            {cert.bullets.map((bullet, idx) => (
                              <p key={idx} className="text-justify text-[9.5pt] text-black leading-relaxed">
                                {bullet}
                              </p>
                            ))}
                          </div>
                        )}
                     </div>
                   ))}
                </div>
              </section>
            );

          case 'skills':
            if (data.skills.length === 0) return null;
            return (
              <section key={sectionId}>
                  {data.skills.map((skill) => (
                      <div key={skill.id} className="mt-4 break-inside-avoid">
                          <h3 className="font-bold text-[11pt] border-b border-black inline-block mb-1" style={{ borderBottomWidth: '0.5px' }}>{skill.category}</h3>
                          <div>{skill.items}</div>
                          {skill.bullets && skill.bullets.length > 0 && (
                            <div className="mt-1.5 space-y-1 pl-0">
                              {skill.bullets.map((bullet, idx) => (
                                <p key={idx} className="text-justify text-[9.5pt] text-black leading-relaxed">
                                  {bullet}
                                </p>
                              ))}
                            </div>
                          )}
                      </div>
                  ))}
              </section>
            );

          case 'workshops':
            if (!data.workshops || data.workshops.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('workshops')} />
                <div className="space-y-3">
                   {data.workshops.map((ws) => {
                     const wsSubtitles = ws.subtitles && ws.subtitles.length > 0
                       ? ws.subtitles
                       : [ws.organizer, ws.location, ws.link].filter(Boolean);
                     return (
                       <div key={ws.id} className="break-inside-avoid">
                          <SplitRow 
                            left={
                                <span className="font-bold text-[11pt]">
                                   {ws.name}
                                </span>
                            }
                            right={<DateSpan>{ws.date}</DateSpan>}
                          />
                          {wsSubtitles.length > 0 && (
                            <div className="text-[9.5pt] text-gray-500 mt-0.5 mb-1 flex flex-wrap items-center">
                              {wsSubtitles.map((sub, sIdx) => (
                                <React.Fragment key={sIdx}>
                                  {sIdx > 0 && <CenteredDivider />}
                                  <span className="italic">
                                    {isUrl(sub) ? (
                                      <a 
                                        href={formatUrl(sub)} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="underline decoration-1 underline-offset-2 hover:text-blue-600"
                                      >
                                        {sub}
                                      </a>
                                    ) : (
                                      sub
                                    )}
                                  </span>
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                          {ws.bullets && ws.bullets.length > 0 && (
                            <div className="mt-1 space-y-1.5 pl-0">
                              {ws.bullets.map((bullet, idx) => (
                                <p key={idx} className="text-justify text-[9.5pt] text-black leading-relaxed">
                                  {bullet}
                                </p>
                              ))}
                            </div>
                          )}
                       </div>
                     );
                   })}
                </div>
              </section>
            );

          case 'links':
            if (!data.links || data.links.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('links')} />
                <div className="space-y-2">
                   {data.links.map((link) => (
                     <div key={link.id} className="break-inside-avoid">
                        <span className="font-bold text-[11pt]">{link.label}</span>
                        {link.url && (
                          <div className="text-sm">
                            <a 
                              href={formatUrl(link.url)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="underline decoration-1 underline-offset-2 hover:text-blue-600 break-all"
                            >
                              {link.url}
                            </a>
                          </div>
                        )}
                     </div>
                   ))}
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

    </div>
  );
};

export default ResumeCanvas;
