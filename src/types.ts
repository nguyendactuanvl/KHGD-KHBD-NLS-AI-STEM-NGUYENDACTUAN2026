export interface KHGDRow {
  id: string;
  grade: number;
  stt: number;
  lesson: string;
  periods: number;
  requirement: string;
  digitalComp: string;
  aiComp: string;
  stem: string;
  note: string;
}

export interface Circular {
  id: string;
  date: string;
  title: string;
}

export interface HistoryItem {
  id: string;
  type: "KHBD" | "KHGD" | "PHT";
  grade: number; // 10, 11, 12
  subject: string;
  lessonName: string;
  content: string; // The generated markdown
  createdAt: number;
}
