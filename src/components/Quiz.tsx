import { useState } from "react";
import { QuizQuestion, TestResult } from "@/types";
import { Button } from "@/components/ui/button";

export function Quiz({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (result: TestResult) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);
    setShowExplanation(true);

    setTimeout(() => {
      setShowExplanation(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((curr) => curr + 1);
      } else {
        // Подсчет результатов
        const incorrectAnswers = questions
          .filter((q, idx) => newAnswers[idx] !== q.correctAnswer)
          .map((q) => q.question);

        const score =
          (newAnswers.filter(
            (answer, idx) => answer === questions[idx].correctAnswer
          ).length /
            questions.length) *
          100;

        onComplete({
          stepId: currentQuestion,
          score,
          completedAt: new Date(),
          incorrectAnswers,
        });
      }
    }, 3000);
  };

  const question = questions[currentQuestion];

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-black/40 p-6 shadow-lg backdrop-blur">
      <div className="mb-4">
        <div className="text-sm text-emerald-400/60">
          Вопрос {currentQuestion + 1} из {questions.length}
        </div>
        <h3 className="mt-2 text-xl font-semibold text-emerald-400">
          {question.question}
        </h3>
      </div>

      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <Button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={showExplanation}
            className={`w-full justify-start p-3 text-left ${
              showExplanation
                ? idx === question.correctAnswer
                  ? "bg-emerald-500 text-black hover:bg-emerald-400"
                  : "bg-red-500 text-white hover:bg-red-400"
                : "bg-black/40 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {option}
          </Button>
        ))}
      </div>

      {showExplanation && (
        <div className="mt-4 rounded border border-emerald-500/20 bg-black/40 p-4">
          <p className="text-sm text-emerald-400/80">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}