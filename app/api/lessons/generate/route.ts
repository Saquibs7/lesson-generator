import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateLesson } from "@/lib/lesson-generator";

export async function POST(request: NextRequest) {
  try {
    const { outline } = await request.json();

    if (!outline || typeof outline !== "string" || outline.trim().length === 0) {
      return NextResponse.json(
        { error: "Lesson outline is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create initial lesson record
    const { data: lesson, error: insertError } = await supabase
      .from("lessons")
      .insert({
        title: "Generating...",
        outline: outline.trim(),
        status: "generating",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating lesson:", insertError);
      return NextResponse.json(
        { error: "Failed to create lesson" },
        { status: 500 }
      );
    }

    // Start generation in the background (don't await)
    generateLessonInBackground(lesson.id, outline.trim());

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Background lesson generation
async function generateLessonInBackground(lessonId: string, outline: string) {
  const supabase = await createClient();

  try {
    // Generate the lesson with AI
    const result = await generateLesson({ outline });

    if (result.success && result.code && result.title) {
      // Update with generated content
      await supabase
        .from("lessons")
        .update({
          title: result.title,
          generated_content: result.code,
          status: "generated",
        })
        .eq("id", lessonId);
    } else {
      // Update with error
      await supabase
        .from("lessons")
        .update({
          status: "failed",
          error_message: result.error || "Unknown error",
        })
        .eq("id", lessonId);
    }
  } catch (error) {
    console.error("Error generating lesson:", error);
    
    // Update with error
    await supabase
      .from("lessons")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", lessonId);
  }
}
