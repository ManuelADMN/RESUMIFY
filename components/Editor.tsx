
import React, { useState } from 'react';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem, SkillItem, CertificationItem } from '../types';
import { improveTextWithGemini } from '../services/geminiService';
import { Wand2, Plus, Trash2, GripVertical, Bold, Italic, Underline, List, ListOrdered, Link2, ChevronDown, ChevronRight, Loader2, Award, Eye, EyeOff } from 'lucide-react';
import { 
  Button, Input, Label, Textarea, 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
  cn 
} from './ui';
import { SortableList } from './SortableList';
import { useLanguage } from '../contexts/LanguageContext';

interface EditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

type ModalType = 'education' | 'experience' | 'project' | 'skill' | 'certification' | null;

interface EditingState {
  type: ModalType;
  id: string | null; // null means adding new
}

// -- Styled Components for Form --
const FormLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-sm font-semibold text-gray-800 mb-1.5 block">
    {children}
  </label>
);

const ToolbarButton = ({ icon: Icon }: { icon: any }) => (
  <button className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
    <Icon className="h-4 w-4" />
  </button>
);

const RichTextToolbar = () => (
  <div className="flex items-center gap-1 border-b border-gray-200 p-1.5 bg-white rounded-t-md">
    <ToolbarButton icon={Bold} />
    <ToolbarButton icon={Italic} />
    <ToolbarButton icon={Underline} />
    <div className="w-px h-4 bg-gray-300 mx-1"></div>
    <ToolbarButton icon={List} />
    <ToolbarButton icon={ListOrdered} />
    <ToolbarButton icon={Link2} />
  </div>
);

// -- Compact List Item Component --
interface ListItemCardProps {
  title: string;
  subtitle: string;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ListItemCard: React.FC<ListItemCardProps> = ({ 
  title, 
  subtitle, 
  onEdit, 
  onDelete 
}) => {
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

const SectionHeader = ({ title, icon: Icon, onAdd, onToggleVisibility, isHidden }: { title: string, icon: any, onAdd: () => void, onToggleVisibility?: () => void, isHidden?: boolean }) => {
  const { t } = useLanguage();
  return (
  <div className="flex items-center justify-between mt-8 mb-4 px-1 group/header">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-gray-800" />
      <h2 className={`text-xl font-bold ${isHidden ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{title}</h2>
      {onToggleVisibility && (
         <button onClick={onToggleVisibility} className={`ml-2 transition-colors ${isHidden ? 'text-blue-500 hover:text-blue-600' : 'text-transparent group-hover/header:text-gray-400 hover:!text-gray-600'}`} title={isHidden ? t('show') : t('hide')}>
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
  const { t } = useLanguage();
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [tempItem, setTempItem] = useState<any>(null); // Holds the data being edited in the modal
  const [loadingAI, setLoadingAI] = useState(false);
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

  const isSectionHidden = (sectionId: string) => {
      return (data.hiddenSections || []).includes(sectionId);
  };

  // --- Handlers for Personal Info (Direct Edit) ---
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [e.target.name]: e.target.value }
    });
  };

  // --- Generic Modal Handlers ---
  const openModal = (type: ModalType, item: any = null) => {
    // If item is null, we create a template
    let initialItem = item;
    if (!initialItem) {
      if (type === 'education') initialItem = { id: crypto.randomUUID(), institution: '', degree: '', location: '', startDate: '', endDate: '', gpaOrHonors: '' };
      if (type === 'experience') initialItem = { id: crypto.randomUUID(), company: '', role: '', location: '', startDate: '', endDate: 'Presente', bullets: [''] };
      if (type === 'project') initialItem = { id: crypto.randomUUID(), name: '', technologies: '', description: [''], link: '', date: '' };
      if (type === 'skill') initialItem = { id: crypto.randomUUID(), category: '', items: '' };
      if (type === 'certification') initialItem = { id: crypto.randomUUID(), name: '', issuer: '', date: '', link: '' };
    }
    
    setTempItem(JSON.parse(JSON.stringify(initialItem))); // Deep copy
    setEditingState({ type, id: item ? item.id : null });
  };

  const closeModal = () => {
    setEditingState(null);
    setTempItem(null);
  };

  const saveModal = () => {
    if (!editingState || !tempItem) return;

    let newData = { ...data };

    if (editingState.type === 'education') {
        const list = editingState.id ? newData.education.map(i => i.id === editingState.id ? tempItem : i) : [...newData.education, tempItem];
        newData.education = list as EducationItem[];
    } else if (editingState.type === 'experience') {
        const list = editingState.id ? newData.experience.map(i => i.id === editingState.id ? tempItem : i) : [...newData.experience, tempItem];
        newData.experience = list as ExperienceItem[];
    } else if (editingState.type === 'project') {
        const list = editingState.id ? newData.projects.map(i => i.id === editingState.id ? tempItem : i) : [...newData.projects, tempItem];
        newData.projects = list as ProjectItem[];
    } else if (editingState.type === 'skill') {
        const list = editingState.id ? newData.skills.map(i => i.id === editingState.id ? tempItem : i) : [...newData.skills, tempItem];
        newData.skills = list as SkillItem[];
    } else if (editingState.type === 'certification') {
        const list = editingState.id 
            ? (newData.certifications || []).map(i => i.id === editingState.id ? tempItem : i) 
            : [...(newData.certifications || []), tempItem];
        newData.certifications = list as CertificationItem[];
    }

    onChange(newData);
    closeModal();
  };

  const deleteItem = (type: ModalType, id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
        let newData = { ...data };
        if (type === 'education') newData.education = newData.education.filter(i => i.id !== id);
        if (type === 'experience') newData.experience = newData.experience.filter(i => i.id !== id);
        if (type === 'project') newData.projects = newData.projects.filter(i => i.id !== id);
        if (type === 'skill') newData.skills = newData.skills.filter(i => i.id !== id);
        if (type === 'certification') newData.certifications = (newData.certifications || []).filter(i => i.id !== id);
        onChange(newData);
    }
  };

  // --- AI Improver Helper ---
  const handleAIImprove = async (text: string, context: string, fieldSetter: (val: string) => void) => {
    if (!text) return;
    setLoadingAI(true);
    const improved = await improveTextWithGemini(text, context);
    fieldSetter(improved);
    setLoadingAI(false);
  };

  return (
    <div className="h-full bg-white p-6 space-y-6 pb-20">
      
      {/* Personal Info Section */}
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

      <div className="w-full h-px bg-gray-100 my-6"></div>

      {/* Lists Sections */}
      <SortableList
          items={data.sectionOrder || ['education', 'experience', 'projects', 'certifications', 'skills']}
          onReorder={(newOrder) => onChange({ ...data, sectionOrder: newOrder })}
          keyExtractor={(id) => id}
          className="space-y-6"
          renderItem={(sectionId) => {
              switch (sectionId) {
                  case 'education':
                      return (
                          <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                              <div className="flex justify-center opacity-0 group-hover/section:opacity-100 transition-opacity -mb-4 cursor-move text-gray-400">
                                  <GripVertical className="h-5 w-5" />
                              </div>
                              <SectionHeader title={t('education')} icon={ListOrdered} onAdd={() => openModal('education')} onToggleVisibility={() => toggleSectionVisibility('education')} isHidden={isSectionHidden('education')} />
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
                              <div className="flex justify-center opacity-0 group-hover/section:opacity-100 transition-opacity -mb-4 cursor-move text-gray-400">
                                  <GripVertical className="h-5 w-5" />
                              </div>
                              <SectionHeader title={t('experience')} icon={List} onAdd={() => openModal('experience')} onToggleVisibility={() => toggleSectionVisibility('experience')} isHidden={isSectionHidden('experience')} />
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
                              <div className="flex justify-center opacity-0 group-hover/section:opacity-100 transition-opacity -mb-4 cursor-move text-gray-400">
                                  <GripVertical className="h-5 w-5" />
                              </div>
                              <SectionHeader title={t('projects')} icon={Wand2} onAdd={() => openModal('project')} onToggleVisibility={() => toggleSectionVisibility('projects')} isHidden={isSectionHidden('projects')} />
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
                              <div className="flex justify-center opacity-0 group-hover/section:opacity-100 transition-opacity -mb-4 cursor-move text-gray-400">
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
                                          subtitle={`${cert.issuer} • ${cert.date}`} 
                                          onEdit={() => openModal('certification', cert)}
                                          onDelete={(e) => { e.stopPropagation(); deleteItem('certification', cert.id); }}
                                      />
                                  )}
                              />
                          </div>
                      );
                  case 'skills':
                      return (
                          <div className="p-2 border border-transparent hover:border-gray-200 rounded-lg group/section transition-colors bg-white">
                              <div className="flex justify-center opacity-0 group-hover/section:opacity-100 transition-opacity -mb-4 cursor-move text-gray-400">
                                  <GripVertical className="h-5 w-5" />
                              </div>
                              <SectionHeader title={t('skills')} icon={List} onAdd={() => openModal('skill')} onToggleVisibility={() => toggleSectionVisibility('skills')} isHidden={isSectionHidden('skills')} />
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
                  default:
                      return null;
              }
          }}
      />

      {/* --- Floating Edit Modals --- */}

      {/* Education Modal */}
      <Dialog open={editingState?.type === 'education'} onOpenChange={closeModal}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{t('education')}</DialogTitle>
                  <DialogClose onClick={closeModal} />
              </DialogHeader>
              <div className="p-6 space-y-4">
                  <div>
                      <FormLabel>{t('institution')}</FormLabel>
                      <Input 
                        value={tempItem?.institution || ''} 
                        onChange={(e) => setTempItem({...tempItem, institution: e.target.value})} 
                        placeholder="Harvard University"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel>{t('degree')}</FormLabel>
                        <Input 
                            value={tempItem?.degree || ''} 
                            onChange={(e) => setTempItem({...tempItem, degree: e.target.value})} 
                            placeholder="Computer Science"
                        />
                      </div>
                      <div>
                         <FormLabel>{t('location')}</FormLabel>
                         <Input 
                            value={tempItem?.location || ''} 
                            onChange={(e) => setTempItem({...tempItem, location: e.target.value})} 
                            placeholder="New York, USA"
                        />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel>{t('startDate')}</FormLabel>
                        <Input 
                            value={tempItem?.startDate || ''} 
                            onChange={(e) => setTempItem({...tempItem, startDate: e.target.value})} 
                            placeholder="Sept 2020"
                        />
                      </div>
                      <div>
                         <FormLabel>{t('endDate')}</FormLabel>
                         <Input 
                            value={tempItem?.endDate || ''} 
                            onChange={(e) => setTempItem({...tempItem, endDate: e.target.value})} 
                            placeholder="Jun 2024"
                        />
                         <div className="flex items-center gap-2 mt-2">
                             <input 
                                type="checkbox" 
                                id="currentStudy"
                                checked={tempItem?.endDate === t('present') || tempItem?.endDate === 'Presente'}
                                onChange={(e) => setTempItem({...tempItem, endDate: e.target.checked ? t('present') : ''})}
                                className="rounded border-gray-300 text-black focus:ring-black"
                             />
                             <label htmlFor="currentStudy" className="text-xs text-gray-600">{t('currentStudy')}</label>
                         </div>
                      </div>
                  </div>
                   <div>
                      <FormLabel>{t('gpa')}</FormLabel>
                      <Input 
                        value={tempItem?.gpaOrHonors || ''} 
                        onChange={(e) => setTempItem({...tempItem, gpaOrHonors: e.target.value})} 
                        placeholder="GPA 3.8/4.0"
                      />
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
                          <FormLabel>{t('company')}</FormLabel>
                          <Input 
                            value={tempItem?.company || ''} 
                            onChange={(e) => setTempItem({...tempItem, company: e.target.value})} 
                            placeholder="Google"
                          />
                      </div>
                       <div>
                          <FormLabel>{t('location')}</FormLabel>
                          <Input 
                            value={tempItem?.location || ''} 
                            onChange={(e) => setTempItem({...tempItem, location: e.target.value})} 
                            placeholder="Madrid"
                          />
                      </div>
                  </div>
                  <div>
                      <FormLabel>{t('role')}</FormLabel>
                      <Input 
                        value={tempItem?.role || ''} 
                        onChange={(e) => setTempItem({...tempItem, role: e.target.value})} 
                        placeholder="Senior Developer"
                      />
                  </div>
                  <div>
                      <FormLabel>{t('linkOptional')}</FormLabel>
                      <Input 
                        value={tempItem?.link || ''} 
                        onChange={(e) => setTempItem({...tempItem, link: e.target.value})} 
                        placeholder="Link texto (ej. Portfolio)"
                      />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel>{t('startDate')}</FormLabel>
                        <Input 
                            value={tempItem?.startDate || ''} 
                            onChange={(e) => setTempItem({...tempItem, startDate: e.target.value})} 
                        />
                      </div>
                      <div>
                         <FormLabel>{t('endDate')}</FormLabel>
                         <Input 
                            value={tempItem?.endDate || ''} 
                            onChange={(e) => setTempItem({...tempItem, endDate: e.target.value})} 
                        />
                      </div>
                  </div>
                  
                  {/* Bullets */}
                   <div>
                       <FormLabel>{t('descriptionAchievements')}</FormLabel>
                       <div className="border border-gray-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-black/5 ring-offset-1">
                           <RichTextToolbar />
                           <div className="bg-white p-2 space-y-2">
                               {tempItem?.bullets?.map((bullet: string, idx: number) => (
                                   <div key={idx} className="flex gap-2">
                                       <div className="flex-1 relative">
                                            <Textarea 
                                                value={bullet}
                                                onChange={(e) => {
                                                    const newBullets = [...tempItem.bullets];
                                                    newBullets[idx] = e.target.value;
                                                    setTempItem({...tempItem, bullets: newBullets});
                                                }}
                                                className="border-0 focus-visible:ring-0 px-2 py-1 min-h-[50px] text-sm"
                                                placeholder={t('describeAchievement')}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1 h-6 w-6 text-indigo-400 hover:text-indigo-600"
                                                onClick={() => handleAIImprove(bullet, `Logro laboral para ${tempItem.role}`, (val) => {
                                                    const newBullets = [...tempItem.bullets];
                                                    newBullets[idx] = val;
                                                    setTempItem({...tempItem, bullets: newBullets});
                                                })}
                                                disabled={loadingAI}
                                            >
                                                {loadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                                            </Button>
                                       </div>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 mt-2" onClick={() => {
                                            const newBullets = tempItem.bullets.filter((_: any, i: number) => i !== idx);
                                            setTempItem({...tempItem, bullets: newBullets});
                                       }}>
                                           <Trash2 className="h-4 w-4" />
                                       </Button>
                                   </div>
                               ))}
                               <Button variant="ghost" size="sm" className="text-xs text-blue-600" onClick={() => setTempItem({...tempItem, bullets: [...(tempItem.bullets || []), '']})}>
                                   {t('addAchievement')}
                               </Button>
                           </div>
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
                      <Input 
                        value={tempItem?.name || ''} 
                        onChange={(e) => setTempItem({...tempItem, name: e.target.value})} 
                      />
                  </div>
                  <div>
                      <FormLabel>{t('techSubtitle')}</FormLabel>
                      <Input 
                        value={tempItem?.technologies || ''} 
                        onChange={(e) => setTempItem({...tempItem, technologies: e.target.value})} 
                      />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel>{t('dates')}</FormLabel>
                        <Input 
                            value={tempItem?.date || ''} 
                            onChange={(e) => setTempItem({...tempItem, date: e.target.value})} 
                            placeholder="Ene 2023 - Presente"
                        />
                      </div>
                      <div>
                         <FormLabel>{t('linkText')}</FormLabel>
                         <Input 
                            value={tempItem?.link || ''} 
                            onChange={(e) => setTempItem({...tempItem, link: e.target.value})} 
                        />
                      </div>
                  </div>
                   {/* Description */}
                   <div>
                       <FormLabel>{t('profSummary')}</FormLabel>
                       <div className="border border-gray-200 rounded-md overflow-hidden">
                           <RichTextToolbar />
                           <div className="bg-white p-2 space-y-2">
                               {tempItem?.description?.map((desc: string, idx: number) => (
                                   <div key={idx} className="flex gap-2">
                                       <div className="flex-1 relative">
                                            <Textarea 
                                                value={desc}
                                                onChange={(e) => {
                                                    const newDesc = [...tempItem.description];
                                                    newDesc[idx] = e.target.value;
                                                    setTempItem({...tempItem, description: newDesc});
                                                }}
                                                 className="border-0 focus-visible:ring-0 px-2 py-1 min-h-[50px] text-sm"
                                            />
                                             <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1 h-6 w-6 text-indigo-400 hover:text-indigo-600"
                                                onClick={() => handleAIImprove(desc, `Descripción proyecto: ${tempItem.name}`, (val) => {
                                                    const newDesc = [...tempItem.description];
                                                    newDesc[idx] = val;
                                                    setTempItem({...tempItem, description: newDesc});
                                                })}
                                                disabled={loadingAI}
                                            >
                                                {loadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                                            </Button>
                                       </div>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 mt-2" onClick={() => {
                                            const newDesc = tempItem.description.filter((_: any, i: number) => i !== idx);
                                            setTempItem({...tempItem, description: newDesc});
                                       }}>
                                           <Trash2 className="h-4 w-4" />
                                       </Button>
                                   </div>
                               ))}
                               <Button variant="ghost" size="sm" className="text-xs text-blue-600" onClick={() => setTempItem({...tempItem, description: [...(tempItem.description || []), '']})}>
                                   {t('addDetail')}
                               </Button>
                           </div>
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
                      <Input 
                        value={tempItem?.name || ''} 
                        onChange={(e) => setTempItem({...tempItem, name: e.target.value})} 
                        placeholder="AWS Certified Solutions Architect"
                      />
                  </div>
                  <div>
                      <FormLabel>{t('issuer')}</FormLabel>
                      <Input 
                        value={tempItem?.issuer || ''} 
                        onChange={(e) => setTempItem({...tempItem, issuer: e.target.value})} 
                        placeholder="Amazon Web Services"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel>{t('date')}</FormLabel>
                        <Input 
                            value={tempItem?.date || ''} 
                            onChange={(e) => setTempItem({...tempItem, date: e.target.value})} 
                            placeholder="Ago 2023"
                        />
                      </div>
                      <div>
                         <FormLabel>{t('linkIdOptional')}</FormLabel>
                         <Input 
                            value={tempItem?.link || ''} 
                            onChange={(e) => setTempItem({...tempItem, link: e.target.value})} 
                        />
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
                      <Input 
                        value={tempItem?.category || ''} 
                        onChange={(e) => setTempItem({...tempItem, category: e.target.value})} 
                        placeholder={t('catPlace')}
                      />
                  </div>
                  <div>
                      <FormLabel>{t('itemsList')}</FormLabel>
                      <Textarea 
                        value={tempItem?.items || ''} 
                        onChange={(e) => setTempItem({...tempItem, items: e.target.value})} 
                        placeholder={t('itemsPlace')}
                      />
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