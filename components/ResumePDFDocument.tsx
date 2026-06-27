import React from 'react';
import {
  Document, Page, Text, View, Link, StyleSheet, Font,
} from '@react-pdf/renderer';
import { ResumeData, WorkshopItem } from '../types';
import {
  DEFAULT_SECTION_ORDER, formatATSDate, getATSLabel, normalizeATSInline,
} from '../utils/atsResume';

// ── Font mapping ──────────────────────────────────────────────────────────────
// react-pdf ships Helvetica, Times-Roman and Courier as built-in PDF fonts.
const fontFamilies: Record<string, { regular: string; bold: string }> = {
  'Arial':          { regular: 'Helvetica',   bold: 'Helvetica-Bold'   },
  'Calibri':        { regular: 'Helvetica',   bold: 'Helvetica-Bold'   },
  'Helvetica':      { regular: 'Helvetica',   bold: 'Helvetica-Bold'   },
  'Times New Roman':{ regular: 'Times-Roman', bold: 'Times-Bold'       },
};
const getFont = (name?: string) => fontFamilies[name || 'Arial'] ?? fontFamilies['Arial'];

// ATS readers work with the PDF text layer. Prevent react-pdf from inserting
// visual hyphens inside words, which otherwise become real characters there.
Font.registerHyphenationCallback(word => [word]);

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 34, paddingBottom: 40,
    paddingLeft: 34, paddingRight: 34,
    fontSize: 10, color: '#000000', lineHeight: 1.1,
  },
  // Header
  name:        { fontSize: 22, textAlign: 'center', marginBottom: 14 },
  contactRow:  { textAlign: 'center', fontSize: 9, lineHeight: 1.35, marginBottom: 6 },
  divider:     { borderBottomWidth: 3, borderBottomColor: '#000000', marginTop: 8, marginBottom: 10 },
  // Summary
  summaryTitle: { fontSize: 13, textTransform: 'uppercase', marginBottom: 4 },
  summaryText:  { fontSize: 10, lineHeight: 1.35 },
  // Section header
  sectionBox:   { marginTop: 14, marginBottom: 5, borderBottomWidth: 0.5, borderBottomColor: '#000000', paddingBottom: 2 },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase' },
  // Entry
  splitRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  splitLeft:   { flex: 1, fontSize: 11, marginRight: 8 },
  splitRight:  { fontSize: 9, color: '#666666', textAlign: 'right' },
  entryTitle:  { fontSize: 11 },
  inlineLink:  { color: '#000000', textDecoration: 'underline' },
  // Subtitles
  subtitleRow: { marginTop: 2, fontSize: 9.5, lineHeight: 1.3, color: '#4b5563' },
  // Bullets
  bulletList:  { marginTop: 4 },
  bulletText:  { marginTop: 1, marginLeft: 10, fontSize: 9.5, lineHeight: 1.35 },
  // Skills
  skillRow:    { marginBottom: 5 },
  skillCat:    { fontSize: 10, lineHeight: 1.2 },
  skillItems:  { fontSize: 9.5, lineHeight: 1.35 },
  // Gap between sibling entries
  entryGap:   { marginTop: 8 },
  expEntryGap: { marginTop: 10 },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const isUrl = (v: string) => /^https?:\/\/|^www\.|[a-z]+\.[a-z]{2,}/i.test(v);
const safeHref = (v: string) => (v.startsWith('http') ? v : `https://${v}`);

// ── Sub-components ────────────────────────────────────────────────────────────

const SubtitleRow: React.FC<{ items: (string | undefined | null)[] }> = ({ items }) => {
  const valid = items.map(normalizeATSInline).filter(Boolean) as string[];
  if (valid.length === 0) return null;
  // A single Text node and explicit separators preserve spaces on extraction.
  return <Text style={s.subtitleRow}>{valid.join(' · ')}</Text>;
};

const BulletList: React.FC<{ items: string[] }> = ({ items }) => {
  const valid = items.map(normalizeATSInline).filter(Boolean);
  if (valid.length === 0) return null;
  return (
    <View style={s.bulletList}>
      {valid.map((b, i) => (
        <Text key={i} style={s.bulletText}>{`• ${b}`}</Text>
      ))}
    </View>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

interface Props { data: ResumeData; lang: string }

const ResumePDFDocument: React.FC<Props> = ({ data, lang }) => {
  const { regular, bold } = getFont(data.font);
  const t = (k: string) => getATSLabel(k, lang);
  const order  = data.sectionOrder?.length ? data.sectionOrder : DEFAULT_SECTION_ORDER;
  const hidden = data.hiddenSections ?? [];
  const contactItems = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.github,
    data.personalInfo.website,
  ].map(normalizeATSInline).filter(Boolean) as string[];

  // Section header
  const SH = ({ title }: { title: string }) => (
    <View style={s.sectionBox} minPresenceAhead={30}>
      <Text style={[s.sectionTitle, { fontFamily: bold }]}>{title}</Text>
    </View>
  );

  // Title row: bold name + optional link on the left, date on the right
  const EntryRow = ({ name, link, start, end, date }: { name: string; link?: string; start?: string; end?: string; date?: string }) => (
    <View style={s.splitRow}>
      <Text style={[s.splitLeft, { fontFamily: regular }]}>
        <Text style={{ fontFamily: bold }}>{normalizeATSInline(name)}</Text>
        {normalizeATSInline(link) && (
          isUrl(normalizeATSInline(link))
            ? <Link src={safeHref(normalizeATSInline(link))} style={s.inlineLink}>{` | ${normalizeATSInline(link)}`}</Link>
            : ` | ${normalizeATSInline(link)}`
        )}
      </Text>
      <Text style={[s.splitRight, { fontFamily: regular }]}>{formatATSDate(start, end, date)}</Text>
    </View>
  );

  // Skill block: bold category then items below
  const SkillBlock = ({ skill }: { skill: { id: string; category: string; items: string; bullets?: string[] } }) => (
    <View style={s.skillRow}>
      {normalizeATSInline(skill.category) && (
        <Text style={[s.skillCat, { fontFamily: bold }]}>{normalizeATSInline(skill.category)}</Text>
      )}
      <Text style={[s.skillItems, { fontFamily: regular }]}>{normalizeATSInline(skill.items)}</Text>
      <BulletList items={skill.bullets ?? []} />
    </View>
  );

  return (
    <Document
      title={`${normalizeATSInline(data.personalInfo.fullName) || 'CV'} - CV`}
      author={normalizeATSInline(data.personalInfo.fullName)}
      subject="Curriculum Vitae"
      keywords="curriculum vitae, resume, ATS"
      creator="Resumify"
      producer="Resumify"
    >
      <Page size="A4" style={[s.page, { fontFamily: regular }]}>

        {/* ─── Header ─────────────────────────────────────────────────── */}
        <Text style={[s.name, { fontFamily: bold }]}>{normalizeATSInline(data.personalInfo.fullName)}</Text>

        {contactItems.length > 0 && <Text style={s.contactRow}>{contactItems.join(' | ')}</Text>}

        {/* ─── Divider ─────────────────────────────────────────────────── */}
        <View style={s.divider} />

        {/* ─── Summary ─────────────────────────────────────────────────── */}
        {data.personalInfo.summary ? (
          <View>
            <Text style={[s.summaryTitle, { fontFamily: bold }]}>{t('summary')}</Text>
            <Text style={[s.summaryText, { fontFamily: regular }]}>{normalizeATSInline(data.personalInfo.summary)}</Text>
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
                  {items.map(l => <View key={l.id}><SkillBlock skill={l} /></View>)}
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
                        <EntryRow name={proj.name} link={proj.link} start={proj.startDate} end={proj.endDate} date={proj.date} />
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
                      <EntryRow name={cert.name} start={cert.startDate} end={cert.endDate} date={cert.date} />
                      <SubtitleRow items={[
                        cert.issuer,
                        cert.link,
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
                        <EntryRow name={ws.name} link={ws.link} start={ws.startDate} end={ws.endDate} date={ws.date} />
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
                      {lnk.url && (
                        <Link src={safeHref(lnk.url)} style={{ fontSize: 9.5, color: '#000000', textDecoration: 'none' }}>
                          {`${lnk.label}: ${lnk.url}`}
                        </Link>
                      )}
                      {!lnk.url && <Text style={[s.entryTitle, { fontFamily: bold }]}>{lnk.label}</Text>}
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
