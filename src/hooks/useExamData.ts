// src/hooks/useExamData.ts
import { useQuery } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ChapterStatus = 'completed' | 'in_progress' | 'locked';

export type ExamChapter = {
  id: string;
  number: number;
  title: string;
  totalQs: number;
  doneQs: number;
  status: ChapterStatus;
};

export type PYQEntry = {
  id: string;
  year: string;
  topic: string;
  qCount: number;
  iconType: string;   // JSON mein string hai → component mein map karenge
  iconColor: string;
};

export type BannerSlide = {
  id: string;
  tag: string;
  headline: string;
  sub: string;
  accentColor: string;
  bgColor: string;
};

export type QuickPracticeItem = {
  id: string;
  label: string;
  iconType: string;
  color: string;
};

export type ExamData = {
  id: string;
  name: string;
  regulation: string;
  badge: string;
  totalQuestions: number;
  totalChapters: number;
  examDate: string;
  overallProgress: number;
  studyHours: number;
  testsTaken: number;
  accuracy: number;
  streak: number;
  currentChapter: ExamChapter;
  chapters: ExamChapter[];
  pyqList: PYQEntry[];
  bannerSlides: BannerSlide[];
  quickPractice: QuickPracticeItem[];
};

// ─── GitHub Raw URL ───────────────────────────────────────────────────────────
// ⚠️ Yahan apna URL paste karo:
// Format: https://raw.githubusercontent.com/{username}/{repo}/{branch}/{path}
const GITHUB_RAW_URL =
  'https://raw.githubusercontent.com/MinersBuddy/data/main/mining_mate_config.json';

// ─── Fetcher ──────────────────────────────────────────────────────────────────
const fetchExamData = async (): Promise<ExamData> => {
  const res = await fetch(GITHUB_RAW_URL);
  if (!res.ok) {
    throw new Error(`GitHub fetch failed: ${res.status}`);
  }
  return res.json();
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useExamData = () => {
  return useQuery<ExamData, Error>({
    queryKey: ['examData', 'mining_mate'],
    queryFn: fetchExamData,
  });
};
