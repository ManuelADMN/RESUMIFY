
import React, { useState } from 'react';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem, SkillItem, CertificationItem, WorkshopItem, LinkItem } from '../types';
import { Plus, Trash2, GripVertical, Briefcase, GraduationCap, Code2, ChevronDown, ChevronRight, Award, Wrench, Eye, EyeOff, Languages, Cpu } from 'lucide-react';
import {
  Button, Input, Textarea,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
  cn
} from './ui';
import { SortableList } from './SortableList';
import { useLanguage } from '../contexts/LanguageContext';

interface EditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

type ModalType = 'education' | 'experience' | 'project' | 'skill' | 'technicalSkill' | 'language' | 'certification' | 'workshop' | 'link' | null;

interface EditingState {
  type: ModalType;
  id: string | null;
}

const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
    {children}
  </label>
);

interface ListItemCardProps {
  title: string;
  subtitle: string;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ListItemCard: React.FC<ListItemCardProps> = ({ title, subtitle, onEdit, onDelete }) => {
  const { t } = useLanguage();
  return (
    <div
      onClick={onEdit}
      className="group flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer relative"
    >
      <div className="text-gray-400 cursor-move">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{title || t('untitled')}</h4>
        <p className="text-sm text-gray-500 truncate">{subtitle || t('noDesc')}</p>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
        title={t('delete')}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

const SectionHeader = ({
  title,
  icon: Icon,
  onAdd,
  onToggleVisibility,
  isHidden,
}: {
  title: string;
  icon: React.ElementType;
  onAdd: () => void;
  onToggleVisibility?: () => void;
  isHidden?: boolean;
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between mt-8 mb-4 px-1 group/header">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-gray-800" />
        <h2 className={`text-xl font-bold ${isHidden ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{title}</h2>
        {onToggleVisibility && (
          <button
            onClick={onToggleVisibility}
            className={`ml-2 transition-colors ${isHidden ? 'text-blue-500 hover:text-blue-600' : 'text-transparent group-hover/header:text-gray-400 hover:!text-gray-600'}`}
            title={isHidden ? t('show') : t('hide')}
          >
            {isHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAdd}
        className={`font-medium ${isHidden ? 'text-gray-400 pointer-events-none opacity-50' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'}`}
      >
        <Plus className="h-4 w-4 mr-1" /> {t('add')}
      </Button>
    </div>
  );
};

const AccordionItem: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-4 font-semibold text-lg text-gray-800 hover:text-blue-600 transition-colors px-2"
    >
      {title}
      {isOpen ? <ChevronDown className="h-5 w-5 shrink-0" /> : <ChevronRight className="h-5 w-5 shrink-0" />}
    </button>
    {isOpen && <div className="pb-4 animate-in slide-in-from-top-2 px-1">{children}</div>}
  </div>
);

const Editor: React.FC<EditorProps> = ({ data, onChange }) => {
  const { t, lang } = useLanguage();
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [tempItem, setTempItem] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string | null>('personal');

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const hidden = data.hiddenSections || [];
    if (hidden.includes(sectionId)) {
      onChange({ ...data, hiddenSections: hidden.filter((id: string) => id !== sectionId) });
    } else {
      onChange({ ...data, hiddenSections: [...hidden, sectionId] });
    }
  };

  const isSectionHidden = (sectionId: string) => (data.hiddenSections || []).includes(sectionId);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [e.target.name]: e.target.value } });
  };

  const openModal = (type: ModalType, item: any = null) => {
    let initialItem = item;
    if (!initialItem) {
      if (type === 'education') initialItem = { id: crypto.randomUUID(), institution: '', degree: '', location: '', startDate: '', endDate: '', gpaOrHonors: '', bullets: [], subtitles: [] };
      if (type === 'experience') initialItem = { id: crypto.randomUUID(), company: '', role: '', location: '', startDate: '', endDate: t('present'), bullets: [''], subtitles: [] };
      if (type === 'project') initialItem = { id: crypto.randomUUID(), name: '', technologies: '', description: [''], link: '', startDate: '', endDate: '', location: '', subtitles: [] };
      if (type === 'skill') initialItem = { id: crypto.randomUUID(), category: '', items: '', bullets: [] };
      if (type === 'technicalSkill') initialItem = { id: crypto.randomUUID(), category: '', items: '', bullets: [] };
      if (type === 'language') initialItem = { id: crypto.randomUUID(), category: '', items: '', bullets: [] };
      if (type === 'certification') initialItem = { id: crypto.randomUUID(), name: '', issuer: '', startDate: '', endDate: '', link: '', location: '', bullets: [] };
      if (type === 'workshop') initialItem = { id: crypto.randomUUID(), name: '', organizer: '', startDate: '', endDate: '', location: '', link: '', bullets: [], subtitles: [] };
      if (type === 'link') initialItem = { id: crypto.randomUUID(), label: '', url: '' };
    }
    setTempItem(JSON.parse(JSON.stringify(initialItem)));
    setEditingState({ type, id: item ? item.id : null });
  };

  const closeModal = () => {
    setEditingState(null);
    setTempItem(null);
  };

  const saveModal = () => {
    if (!editingState || !tempItem) return;
    const newData = { ...data };

    const upsert = <T extends { id: string }>(list: T[], item: T, id: string | null): T[] =>
      id ? list.map(i => i.id === id ? item : i) : [...list, item];

    if (editingState.type === 'education') {
      newData.education = upsert(newData.education, tempItem as EducationItem, editingState.id);
    } else if (editingState.type === 'experience') {
      newData.experience = upsert(newData.experience, tempItem as ExperienceItem, editingState.id);
    } else if (editingState.type === 'project') {
      newData.projects = upsert(newData.projects, tempItem as ProjectItem, editingState.id);
    } else if (editingState.type === 'skill') {
      newData.skills = upsert(newData.skills, tempItem as SkillItem, editingState.id);
    } else if (editingState.type === 'technicalSkill') {
      newData.technicalSkills = upsert(newData.technicalSkills || [], tempItem as SkillItem, editingState.id);
    } else if (editingState.type === 'language') {
      newData.languages = upsert(newData.languages || [], tempItem as SkillItem, editingState.id);
    } else if (editingState.type === 'certification') {
      newData.certifications = upsert(newData.certifications || [], tempItem as CertificationItem, editingState.id);
    } else if (editingState.type === 'workshop') {
      newData.workshops = upsert(newData.workshops || [], tempItem as WorkshopItem, editingState.id);
    } else if (editingState.type === 'link') {
      newData.links = upsert(newData.links || [], tempItem as LinkItem, editingState.id);
    }

    onChange(newData);
    closeModal();
  };

  const deleteItem = (type: ModalType, id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    const newData = { ...data };
    if (type === 'education') newData.education = newData.education.filter(i => i.id !== id);
    if (type === 'experience') newData.experience = newData.experience.filter(i => i.id !== id);
    if (type === 'project') newData.projects = newData.projects.filter(i => i.id !== id);
    if (type === 'skill') newData.skills = newData.skills.filter(i => i.id !== id);
    if (type === 'technicalSkill') newData.technicalSkills = (newData.technicalSkills || []).filter(i => i.id !== id);
    if (type === 'language') newData.languages = (newData.languages || []).filter(i => i.id !== id);
    if (type === 'certification') newData.certifications = (newData.certifications || []).filter(i => i.id !== id);
    if (type === 'workshop') newData.workshops = (newData.workshops || []).filter(i => i.id !== id);
    if (type === 'link') newData.links = (newData.links || []).filter(i => i.id !== id);
    onChange(newData);
  };

  const DEFAULT_SECTION_ORDER = ['technicalSkills', 'education', 'experience', 'projects', 'certifications', 'skills', 'languages', 'workshops', 'links'];

  return (
    <div className="h-full bg-white p-6 space-y-6 pb-20">

      {/* Personal Info */}
      <div className="space-y-4">
        <AccordionItem title={t('personalInfo')} isOpen={activeSection === 'personal'} onToggle={() => toggleSection('personal')}>
          <div className="grid gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <FormLabel>{t('fullName')}</FormLabel>
              <Input name="fullName" value={data.personalInfo.fullName} onChange={handlePersonalChange} className="font-semibold text-lg" />
            </div>
            <div>
              <FormLabel>{t('profSummary')}</FormLabel>
              <Textarea
                name="summary"
                value={data.personalInfo.summary}
                onChange={handlePersonalChange}
                className="min-h-[100px]"
                placeholder={t('profSummaryPlace')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><FormLabel>{t('email')}</FormLabel><Input name="email" value={data.personalInfo.email} onChange={handlePersonalChange} /></div>
              <div><FormLabel>{t('phone')}</FormLabel><Input name="phone" value={data.personalInfo.phone} onChange={handlePersonalChange} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><FormLabel>{t('location')}</FormLabel><Input name="location" value={data.personalInfo.location} onChange={handlePersonalChange} /></div>
              <div><FormLabel>{t('linkedin')}</FormLabel><Input name="linkedin" value={data.personalInfo.linkedin} onChange={handlePersonalChange} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><FormLabel>{t('github')}</FormLabel><Input name="github" value={data.personalInfo.github} onChange={handlePersonalChange} /></div>
              <div><FormLabel>{t('website')}</FormLabel><Input name="website" value={data.personalInfo.website} onChange={handlePersonalChange} /></div>
            </div>
          </div>
        </AccordionItem>
      </div>

      <div className="w-full h-px bg-gray-100 my-6" />

      {/* Sortable Sections */}
      <SortableList
        items={data.sectionOrder || DEFAULT_SECTION_ORDER}
        onReorder={(newOrder) => onChange({ ...data, sectionOrder: newOrder })}
        keyExtractor={(id) => id}
        className="space-y-6"
        renderItem={(sectionId) => {
          switch (sectionId) {
            case 'education':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('education')} icon={GraduationCap} onAdd={() => openModal('education')} onToggleVisibility={() => toggleSectionVisibility('education')} isHidden={isSectionHidden('education')} />
                  <SortableList
                    items={data.education}
                    onReorder={(list) => onChange({ ...data, education: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(edu) => (
                      <ListItemCard
                        title={edu.institution}
                        subtitle={`${edu.degree} • ${edu.startDate} - ${edu.endDate}`}
                        onEdit={() => openModal('education', edu)}
                        onDelete={(e) => { e.stopPropagation(); deleteItem('education', edu.id); }}
                      />
                    )}
                  />
                </div>
              );

            case 'experience':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('experience')} icon={Briefcase} onAdd={() => openModal('experience')} onToggleVisibility={() => toggleSectionVisibility('experience')} isHidden={isSectionHidden('experience')} />
                  <SortableList
                    items={data.experience}
                    onReorder={(list) => onChange({ ...data, experience: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(exp) => (
                      <ListItemCard
                        title={exp.company}
                        subtitle={`${exp.role} • ${exp.startDate} - ${exp.endDate}`}
                        onEdit={() => openModal('experience', exp)}
                        onDelete={(e) => { e.stopPropagation(); deleteItem('experience', exp.id); }}
                      />
                    )}
                  />
                </div>
              );

            case 'projects':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('projects')} icon={Code2} onAdd={() => openModal('project')} onToggleVisibility={() => toggleSectionVisibility('projects')} isHidden={isSectionHidden('projects')} />
                  <SortableList
                    items={data.projects}
                    onReorder={(list) => onChange({ ...data, projects: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(proj) => (
                      <ListItemCard
                        title={proj.name}
                        subtitle={proj.technologies}
                        onEdit={() => openModal('project', proj)}
                        onDelete={(e) => { e.stopPropagation(); deleteItem('project', proj.id); }}
                      />
                    )}
                  />
                </div>
              );

            case 'certifications':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('certifications')} icon={Award} onAdd={() => openModal('certification')} onToggleVisibility={() => toggleSectionVisibility('certifications')} isHidden={isSectionHidden('certifications')} />
                  <SortableList
                    items={data.certifications || []}
                    onReorder={(list) => onChange({ ...data, certifications: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(cert) => (
                      <ListItemCard
                          title={cert.name}
                          subtitle={`${cert.issuer}${(cert.startDate || cert.endDate) ? ' • ' : ''}${cert.startDate || ''}${(cert.startDate && cert.endDate) ? ' - ' : ''}${cert.endDate || ''}`}
                          onEdit={() => openModal('certification', cert)}
                          onDelete={(e) => { e.stopPropagation(); deleteItem('certification', cert.id); }}
                        />
                    )}
                  />
                </div>
              );

            case 'technicalSkills':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('technicalSkills')} icon={Cpu} onAdd={() => openModal('technicalSkill')} onToggleVisibility={() => toggleSectionVisibility('technicalSkills')} isHidden={isSectionHidden('technicalSkills')} />
                  <SortableList
                    items={data.technicalSkills || []}
                    onReorder={(list) => onChange({ ...data, technicalSkills: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(skill) => (
                      <ListItemCard
                        title={skill.category}
                        subtitle={skill.items}
                        onEdit={() => openModal('technicalSkill', skill)}
                        onDelete={(e) => { e.stopPropagation(); deleteItem('technicalSkill', skill.id); }}
                      />
                    )}
                  />
                </div>
              );

            case 'languages':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('languages')} icon={Languages} onAdd={() => openModal('language')} onToggleVisibility={() => toggleSectionVisibility('languages')} isHidden={isSectionHidden('languages')} />
                  <SortableList
                    items={data.languages || []}
                    onReorder={(list) => onChange({ ...data, languages: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(lang_item) => (
                      <ListItemCard
                        title={lang_item.category}
                        subtitle={lang_item.items}
                        onEdit={() => openModal('language', lang_item)}
                        onDelete={(e) => { e.stopPropagation(); deleteItem('language', lang_item.id); }}
                      />
                    )}
                  />
                </div>
              );

            case 'skills':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('skills')} icon={Wrench} onAdd={() => openModal('skill')} onToggleVisibility={() => toggleSectionVisibility('skills')} isHidden={isSectionHidden('skills')} />
                  <SortableList
                    items={data.skills}
                    onReorder={(list) => onChange({ ...data, skills: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(skill) => (
                      <ListItemCard
                        title={skill.category}
                        subtitle={skill.items}
                        onEdit={() => openModal('skill', skill)}
                        onDelete={(e) => { e.stopPropagation(); deleteItem('skill', skill.id); }}
                      />
                    )}
                  />
                </div>
              );

            case 'workshops':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('workshops')} icon={Award} onAdd={() => openModal('workshop')} onToggleVisibility={() => toggleSectionVisibility('workshops')} isHidden={isSectionHidden('workshops')} />
                  <SortableList
                    items={data.workshops || []}
                    onReorder={(list) => onChange({ ...data, workshops: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(ws) => (
                      <ListItemCard
                          title={ws.name}
                          subtitle={`${ws.organizer}${(ws.startDate || ws.endDate) ? ' • ' : ''}${ws.startDate || ''}${(ws.startDate && ws.endDate) ? ' - ' : ''}${ws.endDate || ''}`}
                          onEdit={() => openModal('workshop', ws)}
                          onDelete={(e) => { e.stopPropagation(); deleteItem('workshop', ws.id); }}
                        />
                    )}
                  />
                </div>
              );

            case 'links':
              return (
                <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                  <div className="flex justify-center opacity-20 group-hover/section:opacity-70 transition-opacity -mb-4 cursor-move text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <SectionHeader title={t('links')} icon={Code2} onAdd={() => openModal('link')} onToggleVisibility={() => toggleSectionVisibility('links')} isHidden={isSectionHidden('links')} />
                  <SortableList
                    items={data.links || []}
                    onReorder={(list) => onChange({ ...data, links: list })}
                    keyExtractor={(i) => i.id}
                    renderItem={(link) => (
                      <ListItemCard
                        title={link.label}
                        subtitle={link.url}
                        onEdit={() => openModal('link', link)}
                        onDelete={(e) => { e.stopPropagation(); deleteItem('link', link.id); }}
                      />
                    )}
                  />
                </div>
              );

            default:
              return null;
          }
        }}
      />

      {/* Education Modal */}
      <Dialog open={editingState?.type === 'education'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('education')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <FormLabel>{t('companyOrg')}</FormLabel>
              <Input value={tempItem?.institution || ''} onChange={(e) => setTempItem({ ...tempItem, institution: e.target.value })} placeholder="Universidad de Chile" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>{t('degree')}</FormLabel>
                <Input value={tempItem?.degree || ''} onChange={(e) => setTempItem({ ...tempItem, degree: e.target.value })} placeholder="Ingeniería en Informática" />
              </div>
              <div>
                <FormLabel>{t('location')}</FormLabel>
                <Input value={tempItem?.location || ''} onChange={(e) => setTempItem({ ...tempItem, location: e.target.value })} placeholder="Santiago, Chile" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>{t('startDate')}</FormLabel>
                <Input value={tempItem?.startDate || ''} onChange={(e) => setTempItem({ ...tempItem, startDate: e.target.value })} placeholder="Mar 2020" />
              </div>
              <div>
                <FormLabel>{t('endDate')}</FormLabel>
                <Input value={tempItem?.endDate || ''} onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.value })} placeholder="Dic 2024" />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="currentStudy"
                    checked={tempItem?.endDate === t('present')}
                    onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.checked ? t('present') : '' })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="currentStudy" className="text-xs text-gray-600">{t('currentStudy')}</label>
                </div>
              </div>
            </div>
            <div>
              <FormLabel>{t('gpa')}</FormLabel>
              <Input value={tempItem?.gpaOrHonors || ''} onChange={(e) => setTempItem({ ...tempItem, gpaOrHonors: e.target.value })} placeholder="GPA 6.5/7.0" />
            </div>
            <div>
              <FormLabel>{t('subtitles')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {(tempItem?.subtitles || []).map((sub: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={sub}
                      onChange={(e) => {
                        const newSubs = [...(tempItem.subtitles || [])];
                        newSubs[idx] = e.target.value;
                        setTempItem({ ...tempItem, subtitles: newSubs });
                      }}
                      className="flex-1 h-8 text-sm"
                      placeholder="Subtítulo..."
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, subtitles: tempItem.subtitles.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, subtitles: [...(tempItem.subtitles || []), ''] })}
                >
                  {t('addSubtitle')}
                </Button>
              </div>
            </div>
            <div>
              <FormLabel>{t('bulletsDescription')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {(tempItem?.bullets || []).map((bullet: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="w-4 mt-3 text-[16px] leading-none text-gray-600">•</div>
                    <Textarea
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...(tempItem.bullets || [])];
                        newBullets[idx] = e.target.value;
                        setTempItem({ ...tempItem, bullets: newBullets });
                      }}
                      className="flex-1 min-h-[50px] text-sm"
                      placeholder={t('describeBullet')}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 mt-1 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, bullets: tempItem.bullets.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, bullets: [...(tempItem.bullets || []), ''] })}
                >
                  {t('addBullet')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Experience Modal */}
      <Dialog open={editingState?.type === 'experience'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('experience')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <FormLabel>{t('companyOrg')}</FormLabel>
                <Input value={tempItem?.company || ''} onChange={(e) => setTempItem({ ...tempItem, company: e.target.value })} placeholder="Acme Corp" />
              </div>
              <div>
                <FormLabel>{t('location')}</FormLabel>
                <Input value={tempItem?.location || ''} onChange={(e) => setTempItem({ ...tempItem, location: e.target.value })} placeholder="Santiago, Chile" />
              </div>
            </div>
            <div>
              <FormLabel>{t('role')}</FormLabel>
              <Input value={tempItem?.role || ''} onChange={(e) => setTempItem({ ...tempItem, role: e.target.value })} placeholder="Desarrollador Full Stack" />
            </div>
            <div>
              <FormLabel>{t('linkOptional')}</FormLabel>
              <Input value={tempItem?.link || ''} onChange={(e) => setTempItem({ ...tempItem, link: e.target.value })} placeholder="acmecorp.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>{t('startDate')}</FormLabel>
                <Input value={tempItem?.startDate || ''} onChange={(e) => setTempItem({ ...tempItem, startDate: e.target.value })} placeholder="Ene 2023" />
              </div>
              <div>
                <FormLabel>{t('endDate')}</FormLabel>
                <Input value={tempItem?.endDate || ''} onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.value })} placeholder="Presente" />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="currentJob"
                    checked={tempItem?.endDate === t('present')}
                    onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.checked ? t('present') : '' })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="currentJob" className="text-xs text-gray-600">{lang === 'es' ? 'Trabajo actual' : 'Current job'}</label>
                </div>
              </div>
            </div>
            <div>
              <FormLabel>{t('subtitles')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {(tempItem?.subtitles || []).map((sub: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={sub}
                      onChange={(e) => {
                        const newSubs = [...(tempItem.subtitles || [])];
                        newSubs[idx] = e.target.value;
                        setTempItem({ ...tempItem, subtitles: newSubs });
                      }}
                      className="flex-1 h-8 text-sm"
                      placeholder={t('subtitles')}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, subtitles: tempItem.subtitles.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, subtitles: [...(tempItem.subtitles || []), ''] })}
                >
                  {t('addSubtitle')}
                </Button>
              </div>
            </div>
            <div>
              <FormLabel>{t('descriptionAchievements')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {tempItem?.bullets?.map((bullet: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="w-4 mt-3 text-[16px] leading-none text-gray-600">•</div>
                    <Textarea
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...tempItem.bullets];
                        newBullets[idx] = e.target.value;
                        setTempItem({ ...tempItem, bullets: newBullets });
                      }}
                      className="flex-1 min-h-[50px] text-sm"
                      placeholder={t('describeAchievement')}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 mt-1 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, bullets: tempItem.bullets.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, bullets: [...(tempItem.bullets || []), ''] })}
                >
                  {t('addAchievement')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Modal */}
      <Dialog open={editingState?.type === 'project'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('projects')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <FormLabel>{t('projectName')}</FormLabel>
              <Input value={tempItem?.name || ''} onChange={(e) => setTempItem({ ...tempItem, name: e.target.value })} />
            </div>
            <div>
              <FormLabel>{t('subtitles')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {(tempItem?.subtitles || []).map((sub: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={sub}
                      onChange={(e) => {
                        const newSubs = [...(tempItem.subtitles || [])];
                        newSubs[idx] = e.target.value;
                        setTempItem({ ...tempItem, subtitles: newSubs });
                      }}
                      className="flex-1 h-8 text-sm"
                      placeholder="Subtítulo..."
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, subtitles: tempItem.subtitles.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, subtitles: [...(tempItem.subtitles || []), ''] })}
                >
                  {t('addSubtitle')}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>{t('startDate')}</FormLabel>
                <Input value={tempItem?.startDate || ''} onChange={(e) => setTempItem({ ...tempItem, startDate: e.target.value })} placeholder="Ene 2023" />
              </div>
              <div>
                <FormLabel>{t('endDate')}</FormLabel>
                <Input value={tempItem?.endDate || ''} onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.value })} placeholder="Presente" />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="projectCurrent"
                    checked={tempItem?.endDate === t('present')}
                    onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.checked ? t('present') : '' })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="projectCurrent" className="text-xs text-gray-600">{t('currentStudy')}</label>
                </div>
              </div>
              <div>
                <FormLabel>{t('linkText')}</FormLabel>
                <Input value={tempItem?.link || ''} onChange={(e) => setTempItem({ ...tempItem, link: e.target.value })} />
              </div>
            </div>
            <div>
              <FormLabel>{t('techSubtitle')}</FormLabel>
              <Input value={tempItem?.technologies || ''} onChange={(e) => setTempItem({ ...tempItem, technologies: e.target.value })} />
            </div>
            <div>
              <FormLabel>{t('location')}</FormLabel>
              <Input value={tempItem?.location || ''} onChange={(e) => setTempItem({ ...tempItem, location: e.target.value })} placeholder="Ubicación (Opcional)" />
            </div>
            <div>
              <FormLabel>{t('profSummary')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {tempItem?.description?.map((desc: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="w-4 mt-3 text-[16px] leading-none text-gray-600">•</div>
                    <Textarea
                      value={desc}
                      onChange={(e) => {
                        const newDesc = [...tempItem.description];
                        newDesc[idx] = e.target.value;
                        setTempItem({ ...tempItem, description: newDesc });
                      }}
                      className="flex-1 min-h-[50px] text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 mt-1 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, description: tempItem.description.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, description: [...(tempItem.description || []), ''] })}
                >
                  {t('addDetail')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certification Modal */}
      <Dialog open={editingState?.type === 'certification'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('certifications')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <FormLabel>{t('certName')}</FormLabel>
              <Input value={tempItem?.name || ''} onChange={(e) => setTempItem({ ...tempItem, name: e.target.value })} placeholder="AWS Certified Solutions Architect" />
            </div>
            <div>
              <FormLabel>{t('issuer')}</FormLabel>
              <Input value={tempItem?.issuer || ''} onChange={(e) => setTempItem({ ...tempItem, issuer: e.target.value })} placeholder="Amazon Web Services" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>{t('startDate')}</FormLabel>
                <Input value={tempItem?.startDate || ''} onChange={(e) => setTempItem({ ...tempItem, startDate: e.target.value })} placeholder="Ago 2023" />
              </div>
              <div>
                <FormLabel>{t('endDate')}</FormLabel>
                <Input value={tempItem?.endDate || ''} onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.value })} placeholder="Presente" />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="certCurrent"
                    checked={tempItem?.endDate === t('present')}
                    onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.checked ? t('present') : '' })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="certCurrent" className="text-xs text-gray-600">{t('currentStudy')}</label>
                </div>
              </div>
              <div>
                <FormLabel>{t('linkIdOptional')}</FormLabel>
                <Input value={tempItem?.link || ''} onChange={(e) => setTempItem({ ...tempItem, link: e.target.value })} />
              </div>
              <div>
                <FormLabel>{t('location')}</FormLabel>
                <Input value={tempItem?.location || ''} onChange={(e) => setTempItem({ ...tempItem, location: e.target.value })} placeholder="Ubicación (Opcional)" />
              </div>
            </div>
            <div>
              <FormLabel>{t('bulletsDescription')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {(tempItem?.bullets || []).map((bullet: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="w-4 mt-3 text-[16px] leading-none text-gray-600">•</div>
                    <Textarea
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...(tempItem.bullets || [])];
                        newBullets[idx] = e.target.value;
                        setTempItem({ ...tempItem, bullets: newBullets });
                      }}
                      className="flex-1 min-h-[50px] text-sm"
                      placeholder={t('describeBullet')}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 mt-1 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, bullets: tempItem.bullets.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, bullets: [...(tempItem.bullets || []), ''] })}
                >
                  {t('addBullet')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Modal */}
      <Dialog open={editingState?.type === 'skill'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('skills')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <FormLabel>{t('category')}</FormLabel>
              <Input value={tempItem?.category || ''} onChange={(e) => setTempItem({ ...tempItem, category: e.target.value })} placeholder={t('catPlace')} />
            </div>
            <div>
              <FormLabel>{t('itemsList')}</FormLabel>
              <Textarea value={tempItem?.items || ''} onChange={(e) => setTempItem({ ...tempItem, items: e.target.value })} placeholder={t('itemsPlace')} />
            </div>
            <div>
              <FormLabel>{t('bulletsDescription')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {(tempItem?.bullets || []).map((bullet: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <Textarea
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...(tempItem.bullets || [])];
                        newBullets[idx] = e.target.value;
                        setTempItem({ ...tempItem, bullets: newBullets });
                      }}
                      className="flex-1 min-h-[50px] text-sm"
                      placeholder={t('describeBullet')}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 mt-1 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, bullets: tempItem.bullets.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, bullets: [...(tempItem.bullets || []), ''] })}
                >
                  {t('addBullet')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Technical Skill Modal */}
      <Dialog open={editingState?.type === 'technicalSkill'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('technicalSkills')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <FormLabel>{t('category')}</FormLabel>
              <Input value={tempItem?.category || ''} onChange={(e) => setTempItem({ ...tempItem, category: e.target.value })} placeholder={t('techCatPlace')} />
            </div>
            <div>
              <FormLabel>{t('itemsList')}</FormLabel>
              <Textarea value={tempItem?.items || ''} onChange={(e) => setTempItem({ ...tempItem, items: e.target.value })} placeholder={t('techItemsPlace')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Language Modal */}
      <Dialog open={editingState?.type === 'language'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('languages')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <FormLabel>{t('category')}</FormLabel>
              <Input value={tempItem?.category || ''} onChange={(e) => setTempItem({ ...tempItem, category: e.target.value })} placeholder={t('langCatPlace')} />
            </div>
            <div>
              <FormLabel>{t('itemsList')}</FormLabel>
              <Textarea value={tempItem?.items || ''} onChange={(e) => setTempItem({ ...tempItem, items: e.target.value })} placeholder={t('langItemsPlace')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workshop Modal */}
      <Dialog open={editingState?.type === 'workshop'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('workshops')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <FormLabel>{t('workshopName')}</FormLabel>
              <Input value={tempItem?.name || ''} onChange={(e) => setTempItem({ ...tempItem, name: e.target.value })} placeholder="Taller React 19" />
            </div>
            <div>
              <FormLabel>{t('companyOrg')}</FormLabel>
              <Input value={tempItem?.organizer || ''} onChange={(e) => setTempItem({ ...tempItem, organizer: e.target.value })} placeholder="Denoise Academy" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>{t('startDate')}</FormLabel>
                <Input value={tempItem?.startDate || ''} onChange={(e) => setTempItem({ ...tempItem, startDate: e.target.value })} placeholder="Nov 2024" />
              </div>
              <div>
                <FormLabel>{t('endDate')}</FormLabel>
                <Input value={tempItem?.endDate || ''} onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.value })} placeholder="Presente" />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="workshopCurrent"
                    checked={tempItem?.endDate === t('present')}
                    onChange={(e) => setTempItem({ ...tempItem, endDate: e.target.checked ? t('present') : '' })}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <label htmlFor="workshopCurrent" className="text-xs text-gray-600">{t('currentStudy')}</label>
                </div>
              </div>
            </div>
            <div>
              <FormLabel>{t('linkOptional')}</FormLabel>
              <Input value={tempItem?.link || ''} onChange={(e) => setTempItem({ ...tempItem, link: e.target.value })} placeholder="denoise.cl/workshop" />
            </div>
            <div>
              <FormLabel>{t('location')}</FormLabel>
              <Input value={tempItem?.location || ''} onChange={(e) => setTempItem({ ...tempItem, location: e.target.value })} placeholder="Ubicación (Opcional)" />
            </div>
            <div>
              <FormLabel>{t('subtitles')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {(tempItem?.subtitles || []).map((sub: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      value={sub}
                      onChange={(e) => {
                        const newSubs = [...(tempItem.subtitles || [])];
                        newSubs[idx] = e.target.value;
                        setTempItem({ ...tempItem, subtitles: newSubs });
                      }}
                      className="flex-1 h-8 text-sm"
                      placeholder="Subtítulo..."
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, subtitles: tempItem.subtitles.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, subtitles: [...(tempItem.subtitles || []), ''] })}
                >
                  {t('addSubtitle')}
                </Button>
              </div>
            </div>
            <div>
              <FormLabel>{t('bulletsDescription')}</FormLabel>
              <div className="bg-white border border-gray-200 rounded-md p-2 space-y-2">
                {(tempItem?.bullets || []).map((bullet: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <Textarea
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...(tempItem.bullets || [])];
                        newBullets[idx] = e.target.value;
                        setTempItem({ ...tempItem, bullets: newBullets });
                      }}
                      className="flex-1 min-h-[50px] text-sm"
                      placeholder={t('describeBullet')}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 mt-1 shrink-0"
                      onClick={() => setTempItem({ ...tempItem, bullets: tempItem.bullets.filter((_: any, i: number) => i !== idx) })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => setTempItem({ ...tempItem, bullets: [...(tempItem.bullets || []), ''] })}
                >
                  {t('addBullet')}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Modal */}
      <Dialog open={editingState?.type === 'link'} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('links')}</DialogTitle>
            <DialogClose onClick={closeModal} />
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div>
              <FormLabel>{t('linkLabel')}</FormLabel>
              <Input value={tempItem?.label || ''} onChange={(e) => setTempItem({ ...tempItem, label: e.target.value })} placeholder="Portafolio Personal" />
            </div>
            <div>
              <FormLabel>{t('linkUrl')}</FormLabel>
              <Input value={tempItem?.url || ''} onChange={(e) => setTempItem({ ...tempItem, url: e.target.value })} placeholder="juanperez.dev" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>{t('cancel')}</Button>
            <Button onClick={saveModal} className="bg-black text-white hover:bg-gray-800">{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Editor;
