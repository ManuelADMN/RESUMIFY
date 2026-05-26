
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
    <h2 className="text-[16px] font-bold uppercase tracking-wide border-b border-black pb-1 mb-2 font-serif-custom text-black" style={{ borderBottomWidth: '0.5px' }}>
      {title}
    </h2>
  </div>
);

const ResumeCanvas: React.FC<ResumeCanvasProps> = ({ data }) => {
  const { t } = useLanguage();
  const isUrl = (text: string) => {
    return text.startsWith('http') || text.startsWith('www');
  };

  const formatUrl = (text: string) => {
    if (text.startsWith('www')) return `https://${text}`;
    return text;
  };

  const DateSpan: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-[#666666] text-[9pt]">{children}</span>
  );

  return (
    <div 
      id="resume-canvas"
      className="resume-page bg-white mx-auto text-black font-serif-custom leading-snug print:w-full print:h-full print:absolute print:top-0 print:left-0"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '12mm 12mm', 
        boxSizing: 'border-box',
        fontSize: '10.5pt',
        backgroundColor: 'white'
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
            {data.personalInfo.linkedin && (
                <>
                <span className="mx-1">|</span>
                <a href={`https://${data.personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">{data.personalInfo.linkedin}</a>
                </>
            )}
             {data.personalInfo.github && (
                <>
                <span className="mx-1">|</span>
                <a href={`https://${data.personalInfo.github}`} target="_blank" rel="noreferrer" className="hover:underline">{data.personalInfo.github}</a>
                </>
            )}
             {data.personalInfo.website && (
                <>
                <span className="mx-1">|</span>
                <a href={`https://${data.personalInfo.website}`} target="_blank" rel="noreferrer" className="hover:underline">{data.personalInfo.website}</a>
                </>
            )}
        </div>
      </header>

      {/* Thick Asymmetrical Line above Summary */}
      <div className="w-full h-[3px] bg-black mb-6 mt-4 print:bg-black"></div>

      {/* Summary (Resumen) */}
      <section>
          <h2 className="text-[16px] font-bold uppercase tracking-wide mb-2 font-serif-custom text-black">
            {t('summary')}
          </h2>
          <p className="text-justify text-black whitespace-pre-wrap">
              {data.personalInfo.summary}
          </p>
      </section>

      {(data.sectionOrder || ['education', 'experience', 'projects', 'certifications', 'skills']).map(sectionId => {
        if ((data.hiddenSections || []).includes(sectionId)) return null;
        switch (sectionId) {
          case 'education':
            if (data.education.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('education')} />
                <div className="space-y-3">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="break-inside-avoid">
                      <SplitRow 
                          left={<span className="font-bold text-[11pt]">{edu.institution}</span>} 
                          right={<DateSpan>{edu.startDate} - {edu.endDate}</DateSpan>} 
                      />
                      <SplitRow 
                          left={
                              <span>
                                  {edu.degree}
                                  {edu.location && <> &middot; {edu.location}</>}
                              </span>
                          } 
                          right={<span className="text-[9pt]">{edu.gpaOrHonors}</span>} 
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          
          case 'experience':
            if (data.experience.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('experience')} />
                <div className="space-y-4">
                  {data.experience.map((exp) => (
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
                       <SplitRow 
                          left={<span className="italic">{exp.role}</span>} 
                          right={<span className="text-[9pt]">{exp.location}</span>} 
                      />
                      <ul className="list-disc ml-4 mt-1 space-y-0.5">
                        {exp.bullets.map((bullet, idx) => (
                          <li key={idx} className="pl-1 text-justify">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'projects':
            if (data.projects.length === 0) return null;
            return (
              <section key={sectionId}>
                <SectionHeader title={t('projects')} />
                <div className="space-y-3">
                  {data.projects.map((proj) => (
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
                      {proj.technologies && (
                           <div className="text-left italic mb-1">{proj.technologies}</div>
                      )}
                      <ul className="list-disc ml-4 space-y-0.5">
                        {proj.description.map((desc, idx) => (
                          <li key={idx} className="pl-1 text-justify">
                            {desc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
                                 {cert.issuer && <span className="font-normal text-black"> | {cert.issuer}</span>}
                              </span>
                          }
                          right={<DateSpan>{cert.date}</DateSpan>}
                        />
                        {cert.link && (
                          <div className="text-sm text-black italic">
                             {isUrl(cert.link) ? (
                               <a 
                                 href={formatUrl(cert.link)} 
                                 target="_blank" 
                                 rel="noreferrer" 
                                 className="underline decoration-1 underline-offset-2"
                               >
                                 {t('certLink')}
                               </a>
                             ) : (
                               cert.link
                             )}
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
                      </div>
                  ))}
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
