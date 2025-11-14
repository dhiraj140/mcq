
export interface LocalizedString {
  [languageCode: string]: string;
}

export interface User {
  id: string;
  fullName: string;
  rollNumber: string; // email or roll
  examName: string;
}

export interface Question {
  id: number;
  text: LocalizedString;
  options: LocalizedString[];
  correctAnswerIndex: number;
}

export interface Answer {
  questionId: number;
  selectedOptionIndex: number | null;
  status: 'unanswered' | 'answered' | 'review';
}

export interface Exam {
  name: string;
  durationInMinutes: number;
  questions: Question[];
  supportedLanguages: string[];
  startTime?: string | null;
  endTime?: string | null;
}

export interface ExamResult {
  userId: string;
  examName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  score: number;
  percentage: number;
  remark: string;
  timestamp: string;
}

export interface Coordinator {
  id: string;
  username: string;
  assignedExamName: string;
}
