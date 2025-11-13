"use client";

import { useState, useEffect, useRef } from "react";
import { Lesson } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [outline, setOutline] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch lessons on mount
  useEffect(() => {
    fetchLessons();
  }, []);

  // Set up polling only when there are generating lessons
  useEffect(() => {
    const hasGenerating = lessons.some((l) => l.status === "generating");

    // Clean up existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (hasGenerating) {
      // Poll every 3 seconds for updates (only when generating)
      pollingIntervalRef.current = setInterval(() => {
        fetchLessons();
      }, 3000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons.length, lessons.filter((l) => l.status === "generating").length]);

  const fetchLessons = async () => {
    try {
      const response = await fetch("/api/lessons");
      const data = await response.json();

      if (data.lessons) {
        setLessons(data.lessons);
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!outline.trim()) {
      setError("Please enter a lesson outline");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/lessons/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outline: outline.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate lesson");
      }

      // Add the new lesson to the list
      if (data.lesson) {
        setLessons((prev) => [data.lesson, ...prev]);
      }

      // Clear the form
      setOutline("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate lesson"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "generating":
        return (
          <span
            className={`${baseClasses} bg-blue-100 text-blue-700 animate-pulse`}
          >
            Generating...
          </span>
        );
      case "generated":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-700`}>
            Generated
          </span>
        );
      case "failed":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-700`}>
            Failed
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Lesson Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Create interactive educational content with AI-powered TypeScript
            components
          </p>
        </div>

        {/* Generation Form */}
        <Card className="p-8 mb-12 shadow-xl">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <Label
                htmlFor="outline"
                className="text-lg font-semibold mb-3 block"
              >
                Lesson Outline
              </Label>
              <textarea
                id="outline"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                placeholder="e.g., 'A 10 question pop quiz on Florida' or 'An explanation of how the Cartesian Grid works'"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                disabled={isGenerating}
              />
              <p className="text-sm text-gray-500 mt-2">
                Describe the lesson you want to create. Be specific about the
                content and format.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isGenerating || !outline.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Lesson"
              )}
            </Button>
          </form>
        </Card>

        {/* Lessons Table */}
        <Card className="p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Lessons
          </h2>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No lessons yet
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Get started by creating your first lesson above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Title
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Created
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr
                      key={lesson.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {lesson.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                          {lesson.outline}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(lesson.status)}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(lesson.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {lesson.status === "generated" ? (
                          <Link href={`/lessons/${lesson.id}`}>
                            <Button
                              variant="default"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              View Lesson
                            </Button>
                          </Link>
                        ) : lesson.status === "failed" ? (
                          <span className="text-sm text-red-600 dark:text-red-400">
                            {lesson.error_message || "Generation failed"}
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            Generating...
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Powered by Google Gemini • Built with Next.js, TypeScript & Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
