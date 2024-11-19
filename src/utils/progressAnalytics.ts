import {
  LearningSession,
  PerformanceMetrics,
  TestResult,
  UserNote,
  NoteAnalysis,
} from "../types";

export class ProgressAnalytics {
  static analyzePerformance(
    session: LearningSession | null
  ): PerformanceMetrics {
    if (!session || !session.testResults) {
      throw new Error("Invalid or empty session data provided.");
    }

    const { testResults, notes } = session;

    return {
      averageScore: this.calculateAverageScore(testResults),
      weakAreas: this.identifyWeakAreas(testResults),
      studyTime: this.calculateStudyTime(session),
      notesAnalysis: this.analyzeNotes(notes || []),
      recommendedReview: this.generateReviewRecommendations(testResults),
    };
  }

  private static calculateAverageScore(results: TestResult[]): number {
    if (results.length === 0) return 0;
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    return results.length > 0 ? totalScore / results.length : 0;
  }

  private static identifyWeakAreas(results: TestResult[]): string[] {
    const weakAreaCount: Record<string, number> = {};

    results.forEach((result) =>
      (result.incorrectAnswers || []).forEach((answer) => {
        weakAreaCount[answer] = (weakAreaCount[answer] || 0) + 1;
      })
    );

    return Object.entries(weakAreaCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([area]) => area)
      .slice(0, 5);
  }

  private static calculateStudyTime(session: LearningSession): number {
    if (!session.history.length) return 0;

    const validHistory = session.history.filter(
      (entry) => entry?.timestamp && !isNaN(new Date(entry.timestamp).getTime())
    );

    if (validHistory.length < 2) return 0;

    const startTime = new Date(validHistory[0].timestamp).getTime();
    const lastActivity = new Date(
      validHistory[validHistory.length - 1].timestamp
    ).getTime();

    return Math.round((lastActivity - startTime) / 60000);
  }

  private static analyzeNotes(notes: UserNote[]): NoteAnalysis {
    const commonTags = this.getCommonTags(notes);
    const notesPerDay = this.getNotesFrequency(notes);

    return {
      commonTags,
      notesPerDay,
      totalNotes: notes.length,
    };
  }

  private static getCommonTags(notes: UserNote[]): string[] {
    const tagCount: Record<string, number> = notes
      .flatMap((n) => n.tags || [])
      .reduce((acc: Record<string, number>, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(tagCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  private static getNotesFrequency(notes: UserNote[]): Record<string, number> {
    return notes.reduce((acc: Record<string, number>, note) => {
      const date = new Date(note.timestamp).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  }

  private static generateReviewRecommendations(
    results: TestResult[]
  ): string[] {
    const weakAreas = this.identifyWeakAreas(results);
    return weakAreas.map((area) => `Рекомендуется повторить: ${area}`);
  }
}
