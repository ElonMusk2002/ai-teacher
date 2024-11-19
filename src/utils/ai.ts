import { GoogleGenerativeAI } from "@google/generative-ai";
import { Cache } from "./cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const cache = new Cache();

const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS = 10;

export async function generateLearningContent(
  topic: string,
  currentStage: number,
  previousContent: string = "",
  lastApiCall: number
) {
  const cacheKey = `${topic}-${currentStage}`;
  const cachedContent = cache.get(cacheKey);
  if (cachedContent) {
    return cachedContent;
  }

  const now = Date.now();
  if (now - lastApiCall < RATE_LIMIT_WINDOW / MAX_REQUESTS) {
    throw new Error("Rate limit exceeded");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Создай образовательный контент для темы "${topic}" (этап ${currentStage}/5).
    Формат ответа должен быть в JSON:
    {
      "content": "основной обучающий материал",
      "summary": "краткое содержание для повторения",
      "quiz": [
        {
          "question": "вопрос",
          "options": ["вариант 1", "вариант 2", "вариант 3", "вариант 4"],
          "correctAnswer": 0,
          "explanation": "объяснение правильного ответа"
        }
      ],
      "keyPoints": ["ключевой момент 1", "ключевой момент 2"],
      "practicalTask": "практическое задание"
    }

    Контекст предыдущего этапа (кратко): ${
      previousContent ? previousContent.substring(0, 200) + "..." : "нет"
    }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();

  // Сохраняем в кэш
  cache.set(cacheKey, content, 3600);

  return content;
}
