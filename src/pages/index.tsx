"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LearningSession, TestResult, UserNote } from "@/types";
import { NotesEditor } from "@/components/NotesEditor";
import { Quiz } from "@/components/Quiz";
import { Cache } from "@/utils/cache";
import { StudyMetrics } from "@/components/StudyMetrics";
import { ChevronRight, BookOpen, PenTool, Brain, Sparkles } from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [cache] = useState(new Cache());

  useEffect(() => {
    const savedSessions = Object.keys(localStorage)
      .filter((key) => key.startsWith("learning_session_"))
      .map((key) => JSON.parse(localStorage.getItem(key) || ""))
      .sort((a, b) => b.timestamp - a.timestamp);

    if (savedSessions.length > 0) {
      setSession(savedSessions[0]);
    }
  }, []);

  const clearCache = () => {
    if (session) {
      cache.archive(`learning_session_${session.id}`);
    }
    localStorage.clear();
    setSession(null);
  };

  const startNewSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          stage: 1,
          lastApiCall: session?.lastApiCall || 0,
        }),
      });

      if (response.status === 429) {
        throw new Error("Request limit exceeded. Please wait a minute.");
      }

      const data = await response.json();
      if (typeof data.content !== "string") {
        throw new Error("Invalid content format: Expected a string");
      }
      const sanitizedContent = data.content.replace(/[\x00-\x1F\x7F]/g, "");

      const content = JSON.parse(sanitizedContent);

      const newSession: LearningSession = {
        id: Date.now().toString(),
        topic,
        currentStage: 1,
        progress: 0,
        history: [
          {
            stage: 1,
            content: content.content,
            completed: false,
            timestamp: new Date(),
            quiz: content.quiz,
            summary: content.summary,
          },
        ],
        notes: [],
        testResults: [],
        lastApiCall: Date.now(),
      };

      setSession(newSession);
      localStorage.setItem(
        `learning_session_${newSession.id}`,
        JSON.stringify(newSession)
      );
    } catch (error) {
      console.error("Error starting session:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleNoteAdd = (note: UserNote) => {
    if (!session) return;
    const updatedSession = {
      ...session,
      notes: [...session.notes, note],
    };
    setSession(updatedSession);
    localStorage.setItem(
      `learning_session_${session.id}`,
      JSON.stringify(updatedSession)
    );
  };

  const handleQuizComplete = (result: TestResult) => {
    if (!session) return;
    const updatedSession = {
      ...session,
      testResults: [...session.testResults, result],
      progress: calculateProgress(session, result),
    };
    setSession(updatedSession);
    localStorage.setItem(
      `learning_session_${session.id}`,
      JSON.stringify(updatedSession)
    );
    setShowQuiz(false);
  };

  const calculateProgress = (
    session: LearningSession,
    newResult: TestResult
  ): number => {
    const totalSteps = session.history.length;
    const completedSteps = session.testResults.length;
    const averageScore =
      [...session.testResults, newResult].reduce(
        (acc, curr) => acc + curr.score,
        0
      ) /
      (completedSteps + 1);

    return Math.round((completedSteps / totalSteps) * averageScore);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(transparent_1px,#000_1px),linear-gradient(90deg,transparent_1px,#000_1px)] bg-[size:30px_30px] [background-position:center] [mask-image:linear-gradient(to_bottom,transparent,black)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#1DFF7733,transparent)]" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-10">
        <div className="absolute right-[20%] top-20 h-32 w-32 animate-float">
          <div className="h-full w-full rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 backdrop-blur" />
        </div>
        <div className="absolute left-[15%] top-40 h-24 w-24 animate-float-slow">
          <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur" />
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-[85vw] px-4 py-12">
        <div className="mb-12 flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-emerald-400" />
          <h1 className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            AI Learning System
          </h1>
        </div>

        {!session ? (
          <Card className="mx-auto max-w-lg border border-emerald-500/20 bg-black/40 shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-400">
                Start Your Learning Journey
              </CardTitle>
              <CardDescription className="text-emerald-400/60">
                Enter a topic to begin your AI-powered study session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic to study"
                  className="border-emerald-500/20 bg-black/40 text-emerald-400 placeholder:text-emerald-400/40"
                />
                <Button
                  onClick={startNewSession}
                  disabled={loading || !topic}
                  className="relative w-full overflow-hidden bg-emerald-500 text-black transition-all hover:bg-emerald-400"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? "Loading..." : "Start Learning"}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border border-emerald-500/20 bg-black/40 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-emerald-400">
                  Topic: {session.topic}
                </CardTitle>
                <CardDescription className="text-emerald-400/60">
                  Your current learning progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  value={session.progress}
                  className="h-2 bg-emerald-500/20"
                />
                <p className="mt-2 text-sm text-emerald-400/60">
                  Progress: {session.progress}%
                </p>
              </CardContent>
            </Card>

            <StudyMetrics session={session} />

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/40 p-1">
                <TabsTrigger
                  value="content"
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  Notes
                </TabsTrigger>
                <TabsTrigger
                  value="quiz"
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Quiz
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <Card className="border border-emerald-500/20 bg-black/40 shadow-xl backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl text-emerald-400">
                      Learning Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[60vh] pr-4">
                      {session.history.map((step) => (
                        <div key={step.stage} className="mb-8">
                          <h3 className="mb-4 text-xl font-semibold text-emerald-400">
                            Stage {step.stage}
                          </h3>
                          <div className="prose prose-invert max-w-none">
                            <div className="mb-6 whitespace-pre-wrap text-emerald-400/80">
                              {step.content}
                            </div>
                            <Card className="border border-emerald-500/20 bg-black/40">
                              <CardHeader>
                                <CardTitle className="text-lg text-emerald-400">
                                  Summary
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-emerald-400/80">
                                  {step.summary}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card className="border border-emerald-500/20 bg-black/40 shadow-xl backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl text-emerald-400">
                      Your Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NotesEditor
                      stepId={session.currentStage}
                      onSave={handleNoteAdd}
                    />
                    <ScrollArea className="mt-6 h-[40vh] pr-4">
                      {session.notes.map((note, index) => (
                        <Card
                          key={index}
                          className="mb-4 border border-emerald-500/20 bg-black/40"
                        >
                          <CardHeader>
                            <CardTitle className="text-sm text-emerald-400">
                              Note for Stage {note.stepId}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-emerald-400/80">{note.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quiz">
                <Card className="border border-emerald-500/20 bg-black/40 shadow-xl backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl text-emerald-400">
                      Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showQuiz ? (
                      <Button
                        onClick={() => setShowQuiz(true)}
                        className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
                      >
                        Start Quiz
                      </Button>
                    ) : (
                      <Quiz
                        questions={
                          session.history[session.currentStage - 1].quiz
                        }
                        onComplete={handleQuizComplete}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mb-6 flex justify-end gap-3">
              <Button
                onClick={clearCache}
                className="bg-red-500 text-white hover:bg-red-400"
              >
                Clear Cache & Start New
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
