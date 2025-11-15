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

  // --- Fetch lessons on mount ---
  useEffect(() => {
    fetchLessons();
  }, []);

  useEffect(() => {
    const hasGenerating = lessons.some((l) => l.status === "generating");

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (hasGenerating) {
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
  }, [lessons.length, lessons.filter((l) => l.status === "generating").length]);

  const fetchLessons = async () => {
    try {
      const response = await fetch("/api/lessons");
      const data = await response.json();
      if (data.lessons) setLessons(data.lessons);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!outline.trim()) {
      setError("Please enter a lesson title");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/lessons/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline: outline.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            `Rate limit exceeded. Please wait ${data.retryAfter || 60} seconds.`
          );
        }
        throw new Error(data.error || "Failed to generate lesson");
      }

      if (data.lesson) setLessons((prev) => [data.lesson, ...prev]);

      setOutline("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate lesson");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Status Colors ---
  const getStatusBadge = (status: string) => {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap";

    switch (status) {
      case "generating":
        return (
          <span
            className={`${base} bg-pink-200 text-pink-700 animate-pulse border border-pink-300`}
          >
            🌸 Generating...
          </span>
        );
      case "generated":
        return (
          <span
            className={`${base} bg-green-100 text-green-700 border border-green-300`}
          >
            ✅ Generated
          </span>
        );
      case "failed":
        return (
          <span
            className={`${base} bg-red-100 text-red-700 border border-red-300`}
          >
            ❌ Failed
          </span>
        );
      default:
        return (
          <span
            className={`${base} bg-gray-100 text-gray-700 border border-gray-300`}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCE4EC] to-[#F8BBD0]">
      <div className="container mx-auto px-4 py-12 max-w-6xl">

      <div className="text-center mb-12 mt-10">
  <h1 className="text-5xl font-bold text-[#D81B60] mb-4 drop-shadow-lg">
    🌸 Interactive Lesson Generator – Because Students Deserve Better 😄
  </h1>
  <p className="text-lg text-[#5D4037]/90 max-w-2xl mx-auto">
    Outline likho, chai piyo, aur baaki hum sambhal lenge! 
    Ek click mein boring topics ko banaye engaging, interactive aur thoda sa filmy lessons.
  </p>
</div>


        {/* Form */}
        <Card className="p-8 mb-12 shadow-2xl bg-white/90 border-2 border-pink-200">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <Label
                htmlFor="outline"
                className="text-lg font-semibold mb-3 block text-[#AD1457]"
              >
               Lesson Title
              </Label>

              <textarea
                id="outline"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                placeholder="e.g., 'explain queue data structure' or 'Generate quizes on operating system'"
                className="w-full h-32 px-4 py-3 border-2 border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-400 resize-none text-base bg-white text-[#880E4F]"
                disabled={isGenerating}
              />
            
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 flex gap-3">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isGenerating || !outline.trim()}
              className="w-full bg-gradient-to-r from-[#F06292] to-[#EC407A] hover:from-[#EC407A] hover:to-[#D81B60] text-white font-semibold py-6 text-lg shadow-xl disabled:opacity-50 transition-all duration-300 hover:scale-[1.02]"
            >
              {isGenerating ? "🌸 Generating..." : "Generate Lesson"}
            </Button>
          </form>
        </Card>

        {/* Lessons */}
        <Card className="p-8 shadow-2xl bg-white/90 border-2 border-pink-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-[#EC407A] to-[#F48FB1] w-1 h-8 rounded-full"></div>
            <h2 className="text-2xl font-bold text-[#880E4F]">Lessons Store</h2>
          </div>

          {lessons.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-lg font-semibold text-[#880E4F]">
                No lessons yet
              </h3>
              <p className="text-[#6D4C41]/70 mt-2">
                Start creating beautiful lessons above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-pink-200 bg-pink-50">
                    <th className="text-left py-4 px-4 font-semibold text-[#880E4F]">
                      Title
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-[#880E4F]">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-[#880E4F]">
                      Created
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-[#880E4F]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {lessons.map((lesson) => (
                    <tr
                      key={lesson.id}
                      className="border-b border-pink-100 hover:bg-pink-50/60 transition-all"
                    >
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#AD1457]">
                          {lesson.title}
                        </div>
                        <div className="text-sm text-[#6D4C41]/60 mt-1 line-clamp-1">
                          {lesson.outline}
                        </div>
                      </td>

                      <td className="py-4 px-4">{getStatusBadge(lesson.status)}</td>

                      <td className="py-4 px-4 text-[#6D4C41]/70">
                        {new Date(lesson.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {lesson.status === "generated" ? (
                          <Link href={`/lessons/${lesson.id}`}>
                            <Button className="bg-gradient-to-r from-[#F06292] to-[#EC407A] hover:from-[#EC407A] hover:to-[#D81B60] text-white shadow-lg">
                              👁️ View Lesson
                            </Button>
                          </Link>
                        ) : lesson.status === "failed" ? (
                          <span className="text-sm text-red-600 font-medium">
                            {lesson.error_message || "Generation failed"}
                          </span>
                        ) : (
                          <Button
                            disabled
                            className="opacity-50 border-pink-300 cursor-not-allowed"
                          >
                            ⏳ Generating...
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
        <div className="text-center mt-12 text-[#6D4C41]/80">
          <p className="text-m font-medium">
          🌸 Powered by Google Gemini • Running smoothly… kabhi kabhi 😅  
          </p>
          <span className="text-sm">
      (Agar koi bug mile toh samajh lo—feature hi hoga. 😎)
    </span>
        </div>
      </div>
    </div>
  );
}
