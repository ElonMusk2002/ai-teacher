import { LearningSession, ReviewSchedule } from "../types";

export class SpacedRepetition {
  private static readonly INTERVALS = [1, 3, 7, 14, 30]; // дни

  static calculateNextReview(
    currentStage: number,
    lastReviewDate: Date,
    performance: number
  ): Date {
    const interval =
      this.INTERVALS[currentStage] || this.INTERVALS[this.INTERVALS.length - 1];
    const adjustedInterval = this.adjustIntervalByPerformance(
      interval,
      performance
    );

    const nextReview = new Date(lastReviewDate);
    nextReview.setDate(nextReview.getDate() + adjustedInterval);

    return nextReview;
  }

  private static adjustIntervalByPerformance(
    interval: number,
    performance: number
  ): number {
    // Корректируем интервал на основе успешности выполнения
    const adjustment =
      performance < 70
        ? 0.5 // уменьшаем интервал при плохом результате
        : performance > 90
        ? 1.5 // увеличиваем при отличном
        : 1; // оставляем без изменений при среднем

    return Math.round(interval * adjustment);
  }

  static generateReviewSchedule(session: LearningSession): ReviewSchedule[] {
    return session.testResults.map((result, index) => ({
      stepId: result.stepId,
      nextReview: this.calculateNextReview(
        index,
        result.completedAt,
        result.score
      ),
      topic: session.history[result.stepId].content.substring(0, 100) + "...",
      importance: this.calculateImportance(result.score),
    }));
  }

  private static calculateImportance(score: number): "high" | "medium" | "low" {
    if (score < 70) return "high";
    if (score < 85) return "medium";
    return "low";
  }
}
