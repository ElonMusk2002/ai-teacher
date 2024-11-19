import { NextApiRequest, NextApiResponse } from "next";
import { generateLearningContent } from "@/utils/ai";
import { SpacedRepetition } from "@/utils/spaced-repetition";
import { ProgressAnalytics } from "@/utils/progressAnalytics";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { session } = req.body;
    const analytics = ProgressAnalytics.analyzePerformance(session);
    const reviewSchedule = SpacedRepetition.generateReviewSchedule(session);

    // Оптимизируем следующий контент на основе анализа
    const optimizedPrompt = `
      Тема: ${session.topic}
      Этап: ${session.currentStage + 1}
      Слабые места: ${analytics.weakAreas.join(", ")}
      Средний балл: ${analytics.averageScore}
      
      Пожалуйста, создайте контент, который:
      1. Уделяет особое внимание выявленным слабым местам
      2. Соответствует текущему уровню пользователя
      3. Включает практические примеры
      4. Содержит проверочные вопросы
    `;

    const content = await generateLearningContent(
      session.topic,
      session.currentStage + 1,
      optimizedPrompt,
      session.lastApiCall
    );

    res.status(200).json({
      content,
      nextReview: reviewSchedule[0]?.nextReview,
      recommendations: analytics.recommendedReview,
    });
  } catch (error) {
    console.error("Error optimizing content:", error);
    res.status(500).json({ message: "Error optimizing content" });
  }
}
