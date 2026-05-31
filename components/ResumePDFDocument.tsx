import React from 'react';
import {
  Document, Page, Text, View, Link, StyleSheet,
} from '@react-pdf/renderer';
import { ResumeData, WorkshopItem } from '../types';

// ── Font mapping ──────────────────────────────────────────────────────────────
// react-pdf ships Helvetica, Times-Roman and Courier as built-in PDF fonts.
const fontFamilies: Record<string, { regular: string; bold: string }> = {
  'Arial':          { regular: 'Helvetica',   bold: 'Helvetica-Bold'   },
  'Calibri':        { regular: 'Helvetica',   bold: 'Helvetica-Bold'   },
  'Helvetica':      { regular: 'Helvetica',   bold: 'Helvetica-Bold'   },
  'Times New Roman':{ regular: 'Times-Roman', bold: 'Times-Bold'       },
};
const getFont = (name?: string) => fontFamilies[name || 'Arial'] ?? fontFamilies['Arial'];

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 34, paddingBottom: 40,
    paddingLeft: 34, paddingRight: 34,
    fontSize: 10, color: '#000000', lineHeight: 1.1,
  },
  // Header
  name:        { fontSize: 22, textAlign: 'center', marginBottom: 14 },
  contactRow:  { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', fontSize: 9, marginBottom: 6 },
  sep:         { marginHorizontal: 4, color: '#000000', fontSize: 9 },
  contactLink: { color: '#000000', textDecoration: 'none', fontSize: 9 },
  divider:     { borderBottomWidth: 3, borderBottomColor: '#000000', marginTop: 8, marginBottom: 10 },
  // Summary
  summaryTitle: { fontSize: 13, textTransform: 'uppercase', marginBottom: 4 },
  summaryText:  { fontSize: 10, lineHeight: 1.35 },
  // Section header
  sectionBox:   { marginTop: 14, marginBottom: 5, borderBottomWidth: 0.5, borderBottomColor: '#000000', paddingBottom: 2 },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase' },
  // Entry
  splitRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  splitLeft:   { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  splitRight:  { fontSize: 9, color: '#666666', marginLeft: 8, textAlign: 'right', whiteSpace: 'nowrap' },
  entryTitle:  { fontSize: 11 },
  pipe:        { fontSize: 10, marginHorizontal: 4 },
  inlineLink:  { fontSize: 10, color: '#000000', textDecoration: 'underline' },
  // Subtitles
  subtitleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 2, fontSize: 9.5, color: '#6b7280' },
  subtitleDot: { marginHorizontal: 7, color: '#9ca3af', fontSize: 10 },
  subtitleTxt: { fontSize: 9.5, color: '#6b7280' },
  // Bullets
  bulletList:  { marginTop: 4 },
  bulletRow:   { flexDirection: 'row', marginTop: 1 },
  bulletDot:   { width: 12, fontSize: 9.5 },
  bulletText:  { flex: 1, fontSize: 9.5, lineHeight: 1.35 },
  // Skills
  skillRow:    { marginBottom: 5 },
  skillCat:    { fontSize: 10, lineHeight: 1.2 },
  skillItems:  { fontSize: 9.5, lineHeight: 1.35 },
  // Gap between sibling entries
  entryGap:   { marginTop: 8 },
  expEntryGap: { marginTop: 10 },
});

// ── Tiny translations (no context — react-pdf runs its own reconciler) ────────
const LABELS: Record<string, Record<string, string>> = {
  es: {
    summary: 'Resumen', education: 'Educación', experience: 'Experiencia',
    projects: 'Proyectos', certifications: 'Certificaciones', skills: 'Habilidades',
    technicalSkills: 'Habilidades Técnicas', languages: 'Idiomas',
    workshops: 'Talleres / Conferencias', links: 'Enlaces',
    certLink: 'Ver Certificación',
  },
  en: {
    summary: 'Summary', education: 'Education', experience: 'Experience',
    projects: 'Projects', certifications: 'Certifications', skills: 'Skills',
    technicalSkills: 'Technical Skills', languages: 'Languages',
    workshops: 'Workshops / Conferences', links: 'Links',
    certLink: 'View Certification',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const isUrl = (v: string) => /^https?:\/\/|^www\.|[a-z]+\.[a-z]{2,}$/i.test(v);
const safeHref = (v: string) => (v.startsWith('http') ? v : `https://${v}`);
const dateFmt = (a?: string, b?: string) => [a, b].filter(Boolean).join(' - ');

// ── Sub-components ────────────────────────────────────────────────────────────

const SubtitleRow: React.FC<{ items: (string | undefined | null)[] }> = ({ items }) => {
  const valid = items.filter(Boolean) as string[];
  if (valid.length === 0) return null;
  return (
    <View style={s.subtitleRow}>
      {valid.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Text style={s.subtitleDot}>·</Text>}
          <Text style={s.subtitleTxt}>{item}</Text>
        </React.Fragment>
      ))}
    </View>
  );
};

const BulletList: React.FC<{ items: string[] }> = ({ items }) => {
  const valid = items.filter(b => b.trim().length > 0);
  if (valid.length === 0) return null;
  return (
    <View style={s.bulletList}>
      {valid.map((b, i) => (
        <View key={i} style={s.bulletRow}>
          <Text style={s.bulletDot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface Props { data: ResumeData; lang: string }

const ResumePDFDocument: React.FC<Props> = ({ data, lang }) => {
  const { regular, bold } = getFont(data.font);
  const t = (k: string) => LABELS[lang]?.[k] ?? LABELS.en[k] ?? k;
  const linkLabel = lang === 'es' ? 'Enlace' : 'Link';

  const order  = data.sectionOrder  ?? ['technicalSkills','education','experience','projects','certifications','skills','languages','workshops','links'];
  const hidden = data.hiddenSections ?? [];

  // Section header
  const SH = ({ title }: { title: string }) => (
    <View style={s.sectionBox}>
      <Text style={[s.sectionTitle, { fontFamily: bold }]}>{title}</Text>
    </View>
  );

  // Title row: bold name + optional link on the left, date on the right
  const EntryRow = ({ name, link, start, end }: { name: string; link?: string; start?: string; end?: string }) => (
    <View style={s.splitRow}>
      <View style={s.splitLeft}>
        <Text style={[s.entryTitle, { fontFamily: bold }]}>{name}</Text>
        {link && isUrl(link) && (
          <>
            <Text style={[s.pipe, { fontFamily: regular }]}> | </Text>
            <Link src={safeHref(link)} style={s.inlineLink}>{linkLabel}</Link>
          </>
        )}
      </View>
      <Text style={[s.splitRight, { fontFamily: regular }]}>{dateFmt(start, end)}</Text>
    </View>
  );

  // Skill block: bold category then items below
  const SkillBlock = ({ skill }: { skill: { id: string; category: string; items: string; bullets?: string[] } }) => (
    <View style={s.skillRow}>
      {skill.category ? <Text style={[s.skillCat, { fontFamily: bold }]}>{skill.category}</Text> : null}
      <Text style={[s.skillItems, { fontFamily: regular }]}>{skill.items}</Text>
      <BulletList items={skill.bullets ?? []} />
    </View>
  );

  return (
    <Document hyphenationCallback={(word) => [word]}>
      <Page size="A4" style={[s.page, { fontFamily: regular }]}>

        {/* ─── Header ─────────────────────────────────────────────────── */}
        <Text style={[s.name, { fontFamily: bold }]}>{data.personalInfo.fullName}</Text>

        <View style={s.contactRow}>
          {data.personalInfo.email && (
            <Link src={`mailto:${data.personalInfo.email}`} style={s.contactLink}>{data.personalInfo.email}</Link>
          )}
          {data.personalInfo.phone && (
            <><Text style={s.sep}>|</Text><Text>{data.personalInfo.phone}</Text></>
          )}
          {data.personalInfo.location && (
            <><Text style={s.sep}>|</Text><Text>{data.personalInfo.location}</Text></>
          )}
          {data.personalInfo.linkedin && (() => {
            const u = data.personalInfo.linkedin.replace(/.*linkedin\.com\/in\//, '').replace(/^@/, '').replace(/\/$/, '');
            return <><Text style={s.sep}>|</Text><Link src={`https://linkedin.com/in/${u}`} style={s.contactLink}>LinkedIn</Link></>;
          })()}
          {data.personalInfo.github && (() => {
            const u = data.personalInfo.github.replace(/.*github\.com\//, '').replace(/^@/, '').replace(/\/$/, '');
            return <><Text style={s.sep}>|</Text><Link src={`https://github.com/${u}`} style={s.contactLink}>GitHub</Link></>;
          })()}
          {data.personalInfo.website && (
            <><Text style={s.sep}>|</Text>
            <Link src={safeHref(data.personalInfo.website)} style={s.contactLink}>{linkLabel}</Link></>
          )}
        </View>

        {/* ─── Divider ─────────────────────────────────────────────────── */}
        <View style={s.divider} />

        {/* ─── Summary ─────────────────────────────────────────────────── */}
        {data.personalInfo.summary ? (
          <View>
            <Text style={[s.summaryTitle, { fontFamily: bold }]}>{t('summary')}</Text>
            <Text style={[s.summaryText, { fontFamily: regular }]}>{data.personalInfo.summary}</Text>
          </View>
        ) : null}

        {/* ─── Dynamic sections ────────────────────────────────────────── */}
        {order.map(id => {
          if (hidden.includes(id)) return null;

          switch (id) {

            case 'technicalSkills': {
              const items = data.technicalSkills ?? [];
              if (items.length === 0) return null;
              return (
                <View key={id}>
                  <SH title={t('technicalSkills')} />
                  {items.map(sk => <View key={sk.id}><SkillBlock skill={sk} /></View>)}
                </View>
              );
            }

            case 'languages': {
              const items = data.languages ?? [];
              if (items.length === 0) return null;
              return (
                <View key={id}>
                  <SH title={t('languages')} />
                  {items.map(l => (
                    <View key={l.id} style={{ marginBottom: 3 }}>
                      {l.category ? <Text style={[s.skillCat, { fontFamily: bold }]}>{l.category}</Text> : null}
                      <Text style={[s.skillItems, { fontFamily: regular }]}>{l.items}</Text>
                    </View>
                  ))}
                </View>
              );
            }

            case 'education': {
              if (data.education.length === 0) return null;
              return (
                <React.Fragment key={id}>
                  <SH title={t('education')} />
                  {data.education.map((edu, i) => {
                    const subs = [edu.degree, edu.gpaOrHonors, ...(edu.subtitles ?? []), edu.location].filter(Boolean) as string[];
                    return (
                      <View key={edu.id} style={i > 0 ? s.entryGap : {}} wrap={false}>
                        <EntryRow name={edu.institution} start={edu.startDate} end={edu.endDate} />
                        <SubtitleRow items={subs} />
                        <BulletList items={edu.bullets ?? []} />
                      </View>
                    );
                  })}
                </React.Fragment>
              );
            }

            case 'experience': {
              if (data.experience.length === 0) return null;
              return (
                <React.Fragment key={id}>
                  <SH title={t('experience')} />
                  {data.experience.map((exp, i) => {
                    const subs = [exp.role, ...(exp.subtitles ?? []), exp.location].filter(Boolean) as string[];
                    return (
                      <View key={exp.id} style={i > 0 ? s.expEntryGap : {}} wrap={false}>
                        <EntryRow name={exp.company} link={exp.link} start={exp.startDate} end={exp.endDate} />
                        <SubtitleRow items={subs} />
                        <BulletList items={exp.bullets ?? []} />
                      </View>
                    );
                  })}
                </React.Fragment>
              );
            }

            case 'projects': {
              if (data.projects.length === 0) return null;
              return (
                <React.Fragment key={id}>
                  <SH title={t('projects')} />
                  {data.projects.map((proj, i) => {
                    const subs = [...(proj.subtitles ?? []), proj.technologies, proj.location].filter(Boolean) as string[];
                    return (
                      <View key={proj.id} style={i > 0 ? s.entryGap : {}} wrap={false}>
                        <EntryRow name={proj.name} link={proj.link} start={proj.startDate} end={proj.endDate} />
                        <SubtitleRow items={subs} />
                        <BulletList items={proj.description ?? []} />
                      </View>
                    );
                  })}
                </React.Fragment>
              );
            }

            case 'certifications': {
              const certs = data.certifications ?? [];
              if (certs.length === 0) return null;
              return (
                <React.Fragment key={id}>
                  <SH title={t('certifications')} />
                  {certs.map((cert, i) => (
                    <View key={cert.id} style={i > 0 ? s.entryGap : {}} wrap={false}>
                      <EntryRow name={cert.name} start={cert.startDate} end={cert.endDate} />
                      <SubtitleRow items={[
                        cert.issuer,
                        cert.link && isUrl(cert.link) ? t('certLink') : cert.link,
                      ]} />
                      <BulletList items={cert.bullets ?? []} />
                    </View>
                  ))}
                </React.Fragment>
              );
            }

            case 'skills': {
              if (data.skills.length === 0) return null;
              return (
                <React.Fragment key={id}>
                  <SH title={t('skills')} />
                  {data.skills.map(sk => (
                    <View key={sk.id} wrap={false}>
                      <SkillBlock skill={sk} />
                    </View>
                  ))}
                </React.Fragment>
              );
            }

            case 'workshops': {
              const wss = data.workshops ?? [];
              if (wss.length === 0) return null;
              return (
                <React.Fragment key={id}>
                  <SH title={t('workshops')} />
                  {wss.map((ws, i) => {
                    const subs = [
                      ws.organizer,
                      ...(ws.subtitles ?? []),
                      ws.location && !/^\s*(remoto|remote)\s*$/i.test(ws.location) ? ws.location : '',
                    ].filter(Boolean) as string[];
                    return (
                      <View key={ws.id} style={i > 0 ? s.entryGap : {}} wrap={false}>
                        <EntryRow name={ws.name} link={ws.link} start={ws.startDate} end={ws.endDate} />
                        <SubtitleRow items={subs} />
                        <BulletList items={ws.bullets ?? []} />
                      </View>
                    );
                  })}
                </React.Fragment>
              );
            }

            case 'links': {
              const links = data.links ?? [];
              if (links.length === 0) return null;
              return (
                <React.Fragment key={id}>
                  <SH title={t('links')} />
                  {links.map((lnk, i) => (
                    <View key={lnk.id} style={i > 0 ? { marginTop: 5 } : {}} wrap={false}>
                      <Text style={[s.entryTitle, { fontFamily: bold }]}>{lnk.label}</Text>
                      {lnk.url && (
                        <Link src={safeHref(lnk.url)} style={{ fontSize: 9.5, color: '#000000' }}>{lnk.url}</Link>
                      )}
                    </View>
                  ))}
                </React.Fragment>
              );
            }

            default: return null;
          }
        })}
      </Page>
    </Document>
  );
};

export default ResumePDFDocument;
