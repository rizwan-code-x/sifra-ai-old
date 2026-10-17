import React, { useState, useEffect, useMemo } from 'react';
import { View, UserProfile, ProjectItem } from '../types';
import { 
  FileText, FileSpreadsheet, Code2, Presentation, Image as ImageIcon, FileAudio,
  Search, Filter, ArrowUpDown, Plus, Download, Copy, Trash2, Eye, X, ChevronRight,
  ChevronLeft, Sparkles, Edit3, ArrowLeft, Check, Calendar, HardDrive, Tag, Share2
} from 'lucide-react';

interface ProjectsViewProps {
  userProfile?: UserProfile | null;
  onClose: () => void;
  onNavigate?: (view: View) => void;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'Bengali Neural Speech Synthesis Spec',
    description: 'Architecture documentation and phoneme mapping for SIFRA Bengali TTS and voice processing engine.',
    fileType: 'pdf',
    fileName: 'Bengali_Neural_Speech_Spec.pdf',
    fileSize: '2.4 MB',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    category: 'pdfs',
    tags: ['Bengali AI', 'TTS', 'Voice Engine', 'Spec'],
    contentPreview: "# Bengali Neural Speech Synthesis System Specification\n\n## 1. Overview\nThis document outlines the architectural pipeline for SIFRA's high-fidelity Bengali neural voice assistant supporting both West Bengal (bn-IN) and Bangladeshi (bn-BD) pronunciations.\n\n## 2. Phonetic Normalization Pipeline\n- Grapheme-to-Phoneme (G2P): Maps Bengali script graphemes directly to IPA phoneme representations.\n- Prosody & Intonation: Dynamically applies pitch contours according to detected emotional tone.\n- Neural Decoding: Uses Web Audio API buffer synthesis for sub-100ms response playback.\n\n## 3. Supported Dialects\n1. Standard West Bengal (Kolkata)\n2. Standard Bangladeshi (Dhaka)\n\n---\n*Created by SIFRA Neural Studio*"
  },
  {
    id: 'proj-2',
    title: 'SIFRA Q1 Executive Summary & Deliverables',
    description: 'Complete quarterly overview of platform metrics, active user retention, and voice assistant performance.',
    fileType: 'doc',
    fileName: 'SIFRA_Q1_Executive_Summary.docx',
    fileSize: '1.2 MB',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    category: 'documents',
    tags: ['Executive', 'Q1 Report', 'SIFRA Core'],
    contentPreview: "# SIFRA Executive Platform Briefing\n\n### Project Achievements\n- Live Assistant Latency: Reduced latency down to near-realtime response times.\n- Voice Intelligence: Upgraded acoustic emotion detector with 8 discrete emotional states.\n- Storage & History: Deployed centralized project library with quick document previewing.\n\n### Strategic Objectives for Next Sprint\n- Expand offline cached voice models.\n- Integrate cross-device project syncing."
  },
  {
    id: 'proj-3',
    title: 'User Analytics & Voice Usage Dataset',
    description: 'Tabular dataset of session metrics, voice call durations, and user satisfaction indexes.',
    fileType: 'sheet',
    fileName: 'User_Voice_Analytics_2026.xlsx',
    fileSize: '850 KB',
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    category: 'spreadsheets',
    tags: ['Analytics', 'Spreadsheet', 'Metrics'],
    contentPreview: "Date | Total Sessions | Avg Latency (s) | Bengali Query % | Satisfaction\n2026-10-12 | 1,420 | 0.85s | 78% | 98.4%\n2026-10-13 | 1,890 | 0.82s | 82% | 99.1%\n2026-10-14 | 2,150 | 0.79s | 85% | 99.3%\n2026-10-15 | 2,640 | 0.76s | 89% | 99.6%"
  },
  {
    id: 'proj-4',
    title: 'SIFRA Next-Gen Ecosystem Roadmap',
    description: 'Presentation deck outlining multi-module integration across Quantum, Vault, and Voice Assistant.',
    fileType: 'ppt',
    fileName: 'Sifra_Ecosystem_Roadmap.pptx',
    fileSize: '4.5 MB',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    category: 'presentations',
    tags: ['Roadmap', 'Presentation', 'Slides'],
    contentPreview: "Slide 1: SIFRA 3.0 — The Emotionally Intelligent AI OS\nSlide 2: Neural Bengali Speech Processing Architecture\nSlide 3: Centralized Project Library & Document Quick-Preview\nSlide 4: Restorable Conversation Snippets & Task Contexts\nSlide 5: Privacy, Security & Local Vault Synchronization"
  },
  {
    id: 'proj-5',
    title: 'Bengali Phoneme & G2P Parsing Utility',
    description: 'Source code script for phoneme conversion, diacritic handling, and text normalization.',
    fileType: 'code',
    fileName: 'bengali_phoneme_parser.py',
    fileSize: '42 KB',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    category: 'code',
    tags: ['Python', 'Parser', 'Algorithm'],
    contentPreview: "import re\n\ndef parse_bengali_graphemes(text: str) -> list[str]:\n    cleaned = re.sub(r'[^\\u0980-\\u09FF\\s]', '', text)\n    return cleaned.split()\n\nif __name__ == '__main__':\n    sample = 'শিপ্রা একটি আবেগীয়ভাবে বুদ্ধিমান এআই সহকারী'\n    print('Parsed tokens:', parse_bengali_graphemes(sample))"
  },
  {
    id: 'proj-6',
    title: 'SIFRA UI Color Palette & Design Mockup',
    description: 'High resolution visual specs for dark matrix theme, glowing accents, and modal typography.',
    fileType: 'image',
    fileName: 'Sifra_UI_Design_System.png',
    fileSize: '3.8 MB',
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    category: 'images',
    tags: ['Design', 'PNG', 'UI Mockup'],
    contentPreview: "[Visual Asset Mockup: SIFRA Dark Matrix Design System]\nPrimary Gradient: Amber / Gold (#F59E0B -> #D97706)\nBackground Theme: Deep Space Black (#0A0B10 / #12141C)\nAccent Lighting: Cyber Emerald & Cyan Highlights\nTypography: System Sans-Serif, Inter / SF Pro"
  }
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({ userProfile, onClose, onNavigate }) => {
  const userId = userProfile?.userId || 'default';
  const projectsKey = `sifra_projects_${userId}`;

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(projectsKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
    return DEFAULT_PROJECTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  
  // Quick Preview Modal state
  const [previewProject, setPreviewProject] = useState<ProjectItem | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // New Project Creation Modal State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFileType, setNewFileType] = useState<'pdf' | 'doc' | 'sheet' | 'ppt' | 'code' | 'image'>('pdf');
  const [newContent, setNewContent] = useState('');

  // Persist projects whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(projectsKey, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  }, [projects, projectsKey]);

  // Filtering & Sorting
  const filteredProjects = useMemo(() => {
    return projects
      .filter((proj) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          (selectedCategory === 'pdfs' && proj.fileType === 'pdf') ||
          (selectedCategory === 'documents' && (proj.fileType === 'doc' || proj.category === 'documents')) ||
          (selectedCategory === 'spreadsheets' && (proj.fileType === 'sheet' || proj.category === 'spreadsheets')) ||
          (selectedCategory === 'presentations' && (proj.fileType === 'ppt' || proj.category === 'presentations')) ||
          (selectedCategory === 'code' && (proj.fileType === 'code' || proj.category === 'code')) ||
          (selectedCategory === 'images' && (proj.fileType === 'image' || proj.category === 'images'));

        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          proj.title.toLowerCase().includes(query) ||
          proj.description.toLowerCase().includes(query) ||
          proj.fileName.toLowerCase().includes(query) ||
          proj.tags.some(t => t.toLowerCase().includes(query));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        if (sortBy === 'size') return b.fileSize.localeCompare(a.fileSize);
        return 0;
      });
  }, [projects, selectedCategory, searchQuery, sortBy]);

  // Get file icon styling
  const getFileTypeBadge = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-rose-400" />,
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
          label: 'PDF'
        };
      case 'doc':
      case 'document':
        return {
          icon: <FileText className="w-5 h-5 text-blue-400" />,
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
          label: 'DOC'
        };
      case 'sheet':
      case 'spreadsheet':
        return {
          icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          label: 'XLS'
        };
      case 'ppt':
      case 'presentation':
        return {
          icon: <Presentation className="w-5 h-5 text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          label: 'PPT'
        };
      case 'code':
        return {
          icon: <Code2 className="w-5 h-5 text-purple-400" />,
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
          label: 'CODE'
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-5 h-5 text-cyan-400" />,
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
          label: 'IMG'
        };
      default:
        return {
          icon: <FileAudio className="w-5 h-5 text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          label: 'FILE'
        };
    }
  };

  const handleOpenPreview = (proj: ProjectItem) => {
    setPreviewProject(proj);
    setEditTitleValue(proj.title);
    setIsEditingTitle(false);
  };

  const handleDeleteProject = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (previewProject?.id === id) setPreviewProject(null);
    }
  };

  const handleSaveTitleEdit = () => {
    if (!previewProject || !editTitleValue.trim()) return;
    setProjects(prev =>
      prev.map(p => p.id === previewProject.id ? { ...p, title: editTitleValue.trim(), updatedAt: new Date().toISOString() } : p)
    );
    setPreviewProject(prev => prev ? { ...prev, title: editTitleValue.trim(), updatedAt: new Date().toISOString() } : null);
    setIsEditingTitle(false);
  };

  const handleCopyContent = () => {
    if (!previewProject) return;
    navigator.clipboard.writeText(previewProject.contentPreview);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!previewProject) return;
    const blob = new Blob([previewProject.contentPreview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = previewProject.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let cat: 'documents' | 'pdfs' | 'spreadsheets' | 'presentations' | 'code' | 'images' | 'other' = 'documents';
    if (newFileType === 'pdf') cat = 'pdfs';
    else if (newFileType === 'sheet') cat = 'spreadsheets';
    else if (newFileType === 'ppt') cat = 'presentations';
    else if (newFileType === 'code') cat = 'code';
    else if (newFileType === 'image') cat = 'images';

    const ext = newFileType === 'pdf' ? '.pdf' : newFileType === 'doc' ? '.docx' : newFileType === 'sheet' ? '.xlsx' : newFileType === 'ppt' ? '.pptx' : newFileType === 'code' ? '.py' : '.png';

    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Created with SIFRA Assistant.',
      fileType: newFileType,
      fileName: newTitle.trim().toLowerCase().replace(/\s+/g, '_') + ext,
      fileSize: '1.5 MB',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: cat,
      tags: ['SIFRA Generated', cat],
      contentPreview: newContent.trim() || `Project: ${newTitle}\nCreated: ${new Date().toLocaleString()}\n\nContent generated via SIFRA OS.`
    };

    setProjects(prev => [newItem, ...prev]);
    setIsNewProjectModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewContent('');
  };

  return (
    <div className="h-full w-full flex flex-col font-sans overflow-hidden bg-[#0A0B10] text-[#E2E8F0] select-none">
      
      {/* Top Bar Header */}
      <header className="p-4 border-b border-white/10 bg-[#12141C]/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95 border border-white/10"
            aria-label="Close"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 uppercase flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" /> SIFRA Projects Library
            </h1>
            <p className="text-[10px] text-white/40 font-medium">
              Central deliverable repository & document previewer
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Plus size={15} /> <span>New Project</span>
        </button>
      </header>

      {/* Search, Filter, and Sorting Controls */}
      <div className="p-3 sm:p-4 bg-[#0E1017] border-b border-white/5 space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, files, or tags..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-amber-500/60 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpDown size={12} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">File Size</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'pdfs', label: 'PDFs' },
            { id: 'documents', label: 'Documents' },
            { id: 'spreadsheets', label: 'Spreadsheets' },
            { id: 'presentations', label: 'Presentations' },
            { id: 'code', label: 'Code & Scripts' },
            { id: 'images', label: 'Images' }
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
        {filteredProjects.length === 0 ? (
          <div className="text-center text-white/40 py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
              <FileText size={24} className="text-amber-400/50" />
            </div>
            <p className="text-sm font-bold text-white/70">No Projects Found</p>
            <p className="text-xs text-white/40 mt-1 max-w-xs">
              Try adjusting your search query or filter to find generated files.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {filteredProjects.map((proj) => {
              const badge = getFileTypeBadge(proj.fileType);
              return (
                <div
                  key={proj.id}
                  onClick={() => handleOpenPreview(proj)}
                  className="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/[0.07] transition-all cursor-pointer group shadow-lg"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl border ${badge.bg}`}>
                          {badge.icon}
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">{proj.fileSize}</span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed mb-3">
                      {proj.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {proj.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded-md font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Info & Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={11} /> {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenPreview(proj); }}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-bold flex items-center gap-1 transition-all"
                      >
                        <Eye size={12} /> Preview
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK PREVIEW MODAL */}
      {previewProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-[#12141C] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className={`p-2.5 rounded-xl border shrink-0 ${getFileTypeBadge(previewProject.fileType).bg}`}>
                  {getFileTypeBadge(previewProject.fileType).icon}
                </div>
                <div className="min-w-0">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        className="bg-black/60 border border-amber-500 text-white text-sm font-bold px-2 py-1 rounded-lg focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTitleEdit}
                        className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-white truncate">
                        {previewProject.title}
                      </h2>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="text-white/40 hover:text-amber-400 transition-colors"
                        title="Rename project"
                      >
                        <Edit3 size={13} />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">
                    {previewProject.fileName} • {previewProject.fileSize} • {new Date(previewProject.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewProject(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Preview Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-black/40 space-y-4">
              
              {/* Document / PDF / Sheet Preview Box */}
              <div className="bg-[#0E1017] border border-white/10 rounded-2xl p-4 sm:p-6 font-sans text-xs sm:text-sm leading-relaxed text-gray-200">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[11px] text-white/40 font-mono">
                  <span>PREVIEW MODE: {getFileTypeBadge(previewProject.fileType).label} DOCUMENT</span>
                  <span className="text-amber-400 font-bold">PAGE 1 OF 1</span>
                </div>

                <div className="whitespace-pre-wrap font-mono text-xs sm:text-sm bg-black/50 p-4 rounded-xl border border-white/5 text-amber-100/90 leading-relaxed overflow-x-auto">
                  {previewProject.contentPreview}
                </div>
              </div>

              {/* Tags & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/50 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Tag size={13} className="text-amber-400" />
                  <span>Tags: {previewProject.tags.join(', ')}</span>
                </div>
                <span className="text-[10px] font-mono text-white/30">
                  Last Updated: {new Date(previewProject.updatedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-[#12141C] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFile}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 hover:from-amber-400 hover:to-yellow-400 active:scale-95 transition-all"
                >
                  <Download size={14} /> Download File
                </button>
                <button
                  onClick={handleCopyContent}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Copy size={14} /> {copiedToast ? 'Copied!' : 'Copy Text'}
                </button>
              </div>

              <button
                onClick={(e) => handleDeleteProject(previewProject.id, e)}
                className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>

          </div>
        </div>
      )}

      {/* NEW PROJECT MODAL */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewProject}
            className="bg-[#12141C] border border-white/15 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-amber-400" /> Create New Deliverable Project
              </h3>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Bengali AI Market Research"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-white/60 block mb-1">File Format</label>
                  <select
                    value={newFileType}
                    onChange={(e: any) => setNewFileType(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="doc">Word Document (.docx)</option>
                    <option value="sheet">Spreadsheet (.xlsx)</option>
                    <option value="ppt">Presentation (.pptx)</option>
                    <option value="code">Code Script (.py)</option>
                    <option value="image">Image Asset (.png)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/60 block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 block mb-1">Initial Document Content</label>
                <textarea
                  rows={4}
                  placeholder="Enter project text or notes here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default ProjectsView;
