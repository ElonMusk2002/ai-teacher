import { useState } from "react";
import { ProgressAnalytics } from "@/utils/progressAnalytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { LearningSession } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StudyMetrics({ session }: { session: LearningSession }) {
  const [isVisible, setIsVisible] = useState(false);
  const metrics = ProgressAnalytics.analyzePerformance(session);
  const progressData = session.testResults.map((result, index) => ({
    name: `Тест ${index + 1}`,
    score: result.score,
  }));

  const handleClick = () => {
    setIsVisible(true);
  };

  return (
    <Card className="border border-emerald-500/20 bg-black/40 text-emerald-400 shadow-lg backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Анализ прогресса</CardTitle>
      </CardHeader>
      <CardContent>
        {!isVisible ? (
          <Button
            onClick={handleClick}
            className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
          >
            Показать анализ
          </Button>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="border border-emerald-500/20 bg-black/60">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Средний балл</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {metrics.averageScore.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-emerald-500/20 bg-black/60">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Время обучения</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {metrics.studyTime > 0
                      ? `${metrics.studyTime} мин.`
                      : "Недостаточно данных"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <h4 className="mb-2 font-medium">Прогресс по тестам</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <Line type="monotone" dataKey="score" stroke="#10b981" />
                  <CartesianGrid stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6ee7b7" />
                  <YAxis stroke="#6ee7b7" />
                  <Tooltip
                    content={({ payload }) => (
                      <div className="rounded bg-black/80 p-2 text-emerald-400">
                        {payload?.[0]?.payload.name}: {payload?.[0]?.value}%
                      </div>
                    )}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {metrics.weakAreas.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-2 font-medium">Области для улучшения</h4>
                <ul className="list-inside list-disc space-y-1">
                  {metrics.weakAreas.map((area, index) => (
                    <li
                      key={index}
                      className="cursor-pointer text-emerald-400 hover:underline"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mb-6">
              <h4 className="mb-2 font-medium">Активность по заметкам</h4>
              <div className="flex flex-wrap gap-2">
                {metrics.notesAnalysis.commonTags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded bg-emerald-500/20 px-2 py-1 text-sm text-emerald-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}