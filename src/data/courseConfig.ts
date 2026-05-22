
import {
  Monitor, ShieldCheck, Scale, AlertTriangle, Layers,
  Lightbulb, HeartPulse, Cross, Flame, Pickaxe,
  Cpu, BookOpen, Zap, Award, ClipboardList, HardHat,
  Mountain, Briefcase, Wind, FileText,
} from 'lucide-react-native';

// ─── Color palette (reuse across courses) ─────────────────────────────────────
export const CLR = {
  gold:       '#F59E0B',
  teal:       '#0D9488',
  purple:     '#8B5CF6',
  red:        '#EF4444',
  blue:       '#3B82F6',
  cyan:       '#06B6D4',
  indigo:     '#6366F1',
  orange:     '#F97316',
  success:    '#10B981',
  brown:      '#92400E',
  deepOrange: '#EA580C',
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

export type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

// Single chapter inside a course
export type Chapter = {
  id: string;
  title: string;
  questions: number;
  color: string;
  icon: IconComponent;
  available?: boolean;
  // nested sub-chapters (optional — for future nesting)
  subChapters?: SubChapter[];
};

// Nested sub-chapter (e.g. Topic inside a Chapter)
export type SubChapter = {
  id: string;
  title: string;
  questions: number;
  color: string;
  icon: IconComponent;
};

// PYQ (Previous Year Question) entry
export type PYQEntry = {
  id: string;
  year: string;
  topic: string;
  questions: number;
  color: string;
  icon: IconComponent;
};

// Banner slide for HomeScreen carousel
export type BannerSlide = {
  id: string;
  tag: string;
  headline: string;
  sub: string;
  accentColor: string;
  bgColor: string;
};

// Full course config — one object per exam
export type CourseConfig = {
  id: string;
  name: string;           // "Mining Mate"
  shortName: string;      // "Mate"
  regulation: string;     // "CMR 2017"
  badge: string;          // "OPENCAST"
  icon: string;           // emoji
  color: string;          // primary brand color for this course
  totalQuestions: number;
  examDate: string;       // ISO string
  description: string;
  chapters: Chapter[];
  pyqList: PYQEntry[];
  bannerSlides: BannerSlide[];
};

// ─── MINING MATE ───────────────────────────────────────────────────────────────

export const MINING_MATE: CourseConfig = {
  id:             'mining_mate',
  name:           'Mining Mate',
  shortName:      'Mate',
  regulation:     'CMR 2017',
  badge:          'OPENCAST',
  icon:           '⛏️',
  color:          CLR.gold,
  totalQuestions: 250,
  examDate:       '2026-06-10T00:00:00',
  description:    'Second Class Certificate — CMR 2017 Complete Preparation',

  chapters: [
    { id:'mm01', icon: Monitor,       title: 'Basic of Computer',                                 questions: 30,  color: CLR.orange,     available: false },
    { id:'mm02', icon: ShieldCheck,   title: 'Mine Working & General Safety',                      questions: 150, color: CLR.success,    available: true,
      subChapters: [
        { id:'mm02a', icon: ShieldCheck, title: 'General Safety Rules',         questions: 50, color: CLR.success },
        { id:'mm02b', icon: AlertTriangle,title: 'Accident Prevention',         questions: 60, color: CLR.orange  },
        { id:'mm02c', icon: HeartPulse,  title: 'Emergency Procedures',         questions: 40, color: CLR.red     },
      ]
    },
    { id:'mm03', icon: Scale,         title: 'Mine Legislation',                                   questions: 155, color: CLR.blue,       available: true  },
    { id:'mm04', icon: AlertTriangle, title: 'Traffic Rules',                                      questions: 12,  color: CLR.purple,     available: false },
    { id:'mm05', icon: Layers,        title: 'Plans & Section',                                    questions: 17,  color: CLR.orange,     available: false },
    { id:'mm06', icon: Lightbulb,     title: 'Lighting',                                           questions: 6,   color: CLR.cyan,       available: false },
    { id:'mm07', icon: HeartPulse,    title: 'Mining Diseases',                                    questions: 8,   color: CLR.red,        available: false },
    { id:'mm08', icon: Cross,         title: 'First Aid',                                          questions: 26,  color: CLR.brown,      available: false },
    { id:'mm09', icon: Flame,         title: 'Explosive & Shot Firing',                            questions: 50,  color: CLR.indigo,     available: false },
    { id:'mm10', icon: Pickaxe,       title: 'Method of Working',                                  questions: 21,  color: CLR.deepOrange, available: false },
    { id:'mm11', icon: Cpu,           title: 'Element of Mining Machinery',                        questions: 40,  color: CLR.teal,       available: false },
    { id:'mm12', icon: AlertTriangle, title: 'Precautions against Fire, Explosion & Inundation',  questions: 16,  color: CLR.red,        available: false },
    { id:'mm13', icon: BookOpen,      title: 'Abbreviation used in Mining',                       questions: 181, color: CLR.purple,     available: false },
  ],

  pyqList: [
    { id:'pyq1', year:'2024', topic:'Explosives & Blasting', questions: 25, color: CLR.orange,  icon: Zap       },
    { id:'pyq2', year:'2023', topic:'Mine Regulation 1961',  questions: 30, color: CLR.teal,    icon: BookOpen  },
    { id:'pyq3', year:'2022', topic:'CMR Full Paper',        questions: 40, color: CLR.purple,  icon: ClipboardList },
    { id:'pyq4', year:'2021', topic:'Ventilation Focus',     questions: 22, color: CLR.gold,    icon: Award     },
  ],

  bannerSlides: [
    { id:'b1', tag:'FREE ACCESS', headline:'Mining Mate\nComplete Course', sub:'CMR 2017 • 13 Chapters • 712+ Questions', accentColor: CLR.gold,   bgColor: '#1A1500' },
    { id:'b2', tag:'NEW BATCH',   headline:'PYQ 2024\nNow Available',     sub:'25 Questions • Fully Explained Solutions', accentColor: CLR.teal,   bgColor: '#001A19' },
    { id:'b3', tag:'EXAM ALERT',  headline:'21 Days\nLeft to Prep',       sub:'Stay consistent • 30 Questions/Day',      accentColor: CLR.orange, bgColor: '#1A0D00' },
  ],
};

// ─── OVERMAN ───────────────────────────────────────────────────────────────────

export const OVERMAN: CourseConfig = {
  id:             'overman',
  name:           'Overman',
  shortName:      'Overman',
  regulation:     'CMR 2017',
  badge:          'UNDERGROUND',
  icon:           '🪖',
  color:          CLR.teal,
  totalQuestions: 400,
  examDate:       '2026-08-15T00:00:00',
  description:    'First Class Certificate — Underground Mining',

  chapters: [
    { id:'ov01', icon: HardHat,    title: 'Underground Working Rules',  questions: 25, color: CLR.teal,   available: true  },
    { id:'ov02', icon: ShieldCheck,title: 'Safety Officer Duties',      questions: 18, color: CLR.red,    available: true  },
    { id:'ov03', icon: BookOpen,   title: 'CMR Regulations - Full',     questions: 40, color: CLR.purple, available: false },
    { id:'ov04', icon: Wind,       title: 'Ventilation Systems',        questions: 35, color: CLR.cyan,   available: false },
    { id:'ov05', icon: Flame,      title: 'Explosives Management',      questions: 30, color: CLR.indigo, available: false },
    { id:'ov06', icon: Cpu,        title: 'Mining Machinery & Equip.',  questions: 42, color: CLR.teal,   available: false },
  ],

  pyqList: [
    { id:'pyq1', year:'2024', topic:'Underground Safety',    questions: 30, color: CLR.teal,   icon: ShieldCheck },
    { id:'pyq2', year:'2023', topic:'Ventilation Laws',      questions: 25, color: CLR.cyan,   icon: Wind        },
    { id:'pyq3', year:'2022', topic:'CMR Full Paper',        questions: 40, color: CLR.purple, icon: BookOpen    },
  ],

  bannerSlides: [
    { id:'b1', tag:'AVAILABLE', headline:'Overman\nComplete Course',    sub:'CMR 2017 • 6 Chapters • 190+ Questions', accentColor: CLR.teal,   bgColor: '#001A19' },
    { id:'b2', tag:'PYQ READY', headline:'PYQ 2024\nUnderground Focus', sub:'30 Questions • Explained Solutions',     accentColor: CLR.purple, bgColor: '#0D001A' },
  ],
};

// ─── MINING SIRDAR ─────────────────────────────────────────────────────────────

export const MINING_SIRDAR: CourseConfig = {
  id:             'mining_sirdar',
  name:           'Mining Sirdar',
  shortName:      'Sirdar',
  regulation:     'MMR 2017',
  badge:          'OPENCAST',
  icon:           '⛰️',
  color:          CLR.purple,
  totalQuestions: 220,
  examDate:       '2026-09-20T00:00:00',
  description:    'Second Class Certificate — MMR 2017',

  chapters: [
    { id:'ms01', icon: Mountain,    title: 'MMR General Provisions',   questions: 20, color: CLR.purple, available: true  },
    { id:'ms02', icon: ShieldCheck, title: 'Opencast Mine Safety',     questions: 30, color: CLR.success,available: true  },
    { id:'ms03', icon: Scale,       title: 'MMR Regulations - Full',   questions: 45, color: CLR.blue,   available: false },
    { id:'ms04', icon: Flame,       title: 'Blasting Rules',           questions: 25, color: CLR.red,    available: false },
  ],

  pyqList: [
    { id:'pyq1', year:'2024', topic:'MMR Safety Rules',   questions: 20, color: CLR.purple, icon: ShieldCheck },
    { id:'pyq2', year:'2023', topic:'Opencast Methods',   questions: 25, color: CLR.blue,   icon: Mountain    },
  ],

  bannerSlides: [
    { id:'b1', tag:'MMR 2017', headline:'Mining Sirdar\nComplete Prep', sub:'MMR 2017 • 4 Chapters • 120+ Questions', accentColor: CLR.purple, bgColor: '#0D001A' },
  ],
};

// ─── MANAGER ───────────────────────────────────────────────────────────────────

export const MANAGER: CourseConfig = {
  id:             'manager',
  name:           'Manager',
  shortName:      'Manager',
  regulation:     'CMR + MMR',
  badge:          'OPENCAST',
  icon:           '💼',
  color:          CLR.orange,
  totalQuestions: 500,
  examDate:       '2026-12-01T00:00:00',
  description:    'First Class Certificate — CMR + MMR Combined',

  chapters: [
    { id:'mg01', icon: Briefcase, title: 'Management Responsibilities', questions: 30, color: CLR.orange,  available: true  },
    { id:'mg02', icon: Scale,             title: 'CMR + MMR Combined Laws',     questions: 60, color: CLR.blue,    available: false },
    { id:'mg03', icon: FileText,          title: 'Mine Plans & Records',        questions: 25, color: CLR.teal,    available: false },
    { id:'mg04', icon: ShieldCheck,       title: 'Safety Management System',    questions: 40, color: CLR.success, available: false },
  ],

  pyqList: [
    { id:'pyq1', year:'2024', topic:'Management Laws',  questions: 35, color: CLR.orange, icon: Briefcase },
    { id:'pyq2', year:'2023', topic:'CMR+MMR Combined', questions: 50, color: CLR.blue,   icon: Scale             },
  ],

  bannerSlides: [
    { id:'b1', tag:'PREMIUM', headline:'Manager\nComplete Course', sub:'CMR+MMR • 4 Chapters • 155+ Questions', accentColor: CLR.orange, bgColor: '#1A0D00' },
  ],
};

// ─── ALL COURSES LIST (for course selection screen) ───────────────────────────
// CMS se fetch karne ke baad isko replace karna — abhi hardcoded

export const ALL_COURSES: CourseConfig[] = [
  MINING_MATE,
  OVERMAN,
  MINING_SIRDAR,
  MANAGER,
];

// Helper: id se course find karo
export const getCourseById = (id: string): CourseConfig | undefined =>
  ALL_COURSES.find(c => c.id === id);