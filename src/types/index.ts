export interface LearningSession {
  id: string;
  topic: string;
  currentStage: number;
  progress: number;
  history: LearningStep[];
  notes: UserNote[];
  testResults: TestResult[];
  lastApiCall: number;
}

export interface ReviewSchedule {
  stepId: number;
  nextReview: Date;
  topic: string;
  importance: "high" | "medium" | "low";
}

export interface LearningStep {
  stage: number;
  content: string;
  completed: boolean;
  timestamp: Date;
  quiz: QuizQuestion[];
  summary: string;
}

export interface UserNote {
  id: string;
  content: string;
  timestamp: Date;
  stepId: number;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface TestResult {
  stepId: number;
  score: number;
  completedAt: Date;
  incorrectAnswers: string[];
}

export interface PerformanceMetrics {
  averageScore: number;
  weakAreas: string[];
  studyTime: number;
  notesAnalysis: NoteAnalysis;
  recommendedReview: string[];
}

export interface NoteAnalysis {
  commonTags: string[];
  notesPerDay: Record<string, number>;
  totalNotes: number;
}
