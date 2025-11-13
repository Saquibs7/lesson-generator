"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lesson } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [LessonComponent, setLessonComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchLesson(params.id as string);
    }
  }, [params.id]);

  const fetchLesson = async (id: string) => {
    try {
      const response = await fetch(`/api/lessons/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch lesson");
      }

      setLesson(data.lesson);

      // If the lesson is still generating, poll for updates
      if (data.lesson.status === "generating") {
        setTimeout(() => fetchLesson(id), 2000);
      } else if (
        data.lesson.status === "generated" &&
        data.lesson.generated_content
      ) {
        // Dynamically load and render the component
        loadComponent(data.lesson.generated_content);
      } else if (data.lesson.status === "failed") {
        setError(data.lesson.error_message || "Lesson generation failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  };

  const loadComponent = async (generatedCode: string) => {
    try {
      // Wait a bit for React to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Transform the code to work in browser
      const transformedCode = transformCode(generatedCode);

      // Get React from window - it should be loaded by script tags in layout
      const ReactLib = (window as any).React;
      if (!ReactLib) {
        throw new Error("React is not loaded. Please refresh the page.");
      }

      // Create a wrapper that provides React and hooks
      const executableCode = `
        (function() {
          const React = window.React;
          const { useState, useEffect, useCallback, useMemo, useRef } = React;
          
          ${transformedCode}
          
          return LessonComponent;
        })()
      `;

      // Execute the code and get the component
      const component = eval(executableCode);

      if (component) {
        setLessonComponent(() => component);
      } else {
        throw new Error("Failed to create component");
      }
    } catch (err) {
      console.error("Error loading component:", err);
      setError(
        "Failed to render lesson component: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const transformCode = (code: string): string => {
    let transformed = code;

    // Remove ALL variations of "use client" (including malformed ones)
    transformed = transformed.replace(/["']use client["'];?/gi, "");
    transformed = transformed.replace(/use\s+client["'];?/gi, "");
    transformed = transformed.replace(/["']?use client["']?;?/gi, "");

    // Remove all import statements (including multiline)
    transformed = transformed.replace(
      /import\s+[\s\S]*?from\s+["'][^"']+["'];?\s*/g,
      ""
    );

    // Remove standalone import statements
    transformed = transformed.replace(/import\s+["'][^"']+["'];?\s*/g, "");

    // Replace "export default function ComponentName" with "function LessonComponent"
    transformed = transformed.replace(
      /export\s+default\s+function\s+\w+/g,
      "function LessonComponent"
    );

    // Remove any remaining "export default"
    transformed = transformed.replace(/export\s+default\s+/g, "");

    // Clean up multiple newlines and whitespace
    transformed = transformed.trim().replace(/\n{3,}/g, "\n\n");

    return transformed;
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Loading lesson...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                Error Loading Lesson
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
              <Link href="/">
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Lesson not found
          </p>
          <Link href="/">
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (lesson.status === "generating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Generating Your Lesson
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            This may take a moment. The page will update automatically when
            ready.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Back to Lessons
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {lesson.title}
          </h1>
        </div>

        {/* Render the generated lesson component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {LessonComponent ? (
            <div className="p-0">
              <LessonComponent />
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Unable to render lesson content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
