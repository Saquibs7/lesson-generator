import { GoogleGenerativeAI } from "@google/generative-ai";
import { traceable } from "langsmith/traceable";
import { validateTypeScriptCode } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const titleModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const codeModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface GenerateLessonParams {
  outline: string;
  retryCount?: number;
}

interface GenerateLessonResult {
  success: boolean;
  code?: string;
  title?: string;
  error?: string;
}

const MAX_RETRIES = 3;

/**
 * Extract title from lesson outline
 */
const extractTitle = traceable(
  async (outline: string): Promise<string> => {
    const prompt = `Extract a short, clear title (max 60 characters) from the lesson outline. Return only the title, nothing else.\n\nLesson outline: ${outline}`;
    
    const result = await titleModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return text.trim() || "Untitled Lesson";
  },
  { name: "extract_title" }
);

/**
 * Generate TypeScript React component code for a lesson
 */
const generateLessonCode = traceable(
  async (outline: string, attempt: number): Promise<string> => {
    const prompt = `
You are an advanced React + TypeScript educator and interactive lesson generator.

CRITICAL RULES:
Never output backticks.
Never output code fences.
Never output markdown.
Return only pure TSX.
No wrapping code with symbols or formatting.

MODES OF BEHAVIOR:

MODE A (normal text):
If user asks non-technical questions → output plain text.

MODE B (interactive lesson):
If topic is educational, technical, programming, math, OS, DBMS, compiler, physics, geometry:
• Generate a complete self-contained TSX component.
• Must start exactly with:
use client;
import { useState, useEffect, useMemo } from "react";
export default function LessonComponent() {
• Must compile without errors.
• Use Tailwind or inline styles (but never mix inside same element).
• Add collapsible sections, toggles, explanations, examples, diagrams.
• If numeric/visual: add sliders, inputs, SVG diagrams.
• All SVG attributes must be plain strings (no template literals).
• All JSX attributes must be plain strings (no backticks, no template literals).
• Include cards, sections, summaries, callouts, key takeaways.
• Use React hooks properly.

MODE C (visualization detection):
If outline mentions draw/plot/graph/diagram/coordinates/SVG/visualization:
• Include interactive SVG visualization.
• No template literals inside SVG.

MODE D (error fix):
If system sends faulty code:
• Return corrected TSX only.
• No explanations.

GLOBAL RULES:
• All TSX must be valid React + TypeScript.
• No markdown.
• No backticks anywhere.
• No template literal artifacts.
• No external imports.
• Self-contained only.
• Code examples inside lesson must use <pre><code>…text…</code></pre> (no backticks).

NOW GENERATE THE TSX USING THE OUTLINE BELOW:

${outline}

${attempt > 1 ? `This is attempt ${attempt}. Previous attempts failed validation. Ensure strict TSX and no template literals.` : ""}
`;

    const result = await codeModel.generateContent(prompt);
    const response = result.response;
    let code = response.text();

    code = code
      .replace(/```tsx?/g, "")
      .replace(/```/g, "")
      .trim();

    return code;
  },
  { name: "generate_lesson_code" }
);

/**
 * Validate and fix generated code
 */
const validateAndFixCode = traceable(
  async (code: string, outline: string, attempt: number): Promise<{ isValid: boolean; code: string; errors: string[] }> => {
    const validation = validateTypeScriptCode(code);
    
    if (validation.isValid) {
      return { isValid: true, code, errors: [] };
    }
    
    if (attempt < MAX_RETRIES) {
      const fixPrompt = `
The following TypeScript React component has validation errors:

${validation.errors.join("\n")}

Fix the code. Rules:
- Return pure TSX only
- No markdown, no backticks, no code fences
- Must compile
- Must remain a complete, self-contained component
- Must use Tailwind or inline styles only

ORIGINAL CODE:
${code}
`;

      const result = await codeModel.generateContent(fixPrompt);
      let fixedCode = result.response.text();

      fixedCode = fixedCode
        .replace(/```tsx?/g, "")
        .replace(/```/g, "")
        .trim();

      const revalidation = validateTypeScriptCode(fixedCode);

      return { isValid: revalidation.isValid, code: fixedCode, errors: revalidation.errors };
    }
    
    return { isValid: false, code, errors: validation.errors };
  },
  { name: "validate_and_fix_code" }
);

/**
 * Main lesson generation function with tracing
 */
export const generateLesson = traceable(
  async ({ outline, retryCount = 0 }: GenerateLessonParams): Promise<GenerateLessonResult> => {
    try {
      const title = await extractTitle(outline);
      const code = await generateLessonCode(outline, retryCount + 1);
      const validation = await validateAndFixCode(code, outline, retryCount + 1);
      
      if (!validation.isValid) {
        if (retryCount < MAX_RETRIES - 1) {
          return generateLesson({ outline, retryCount: retryCount + 1 });
        }
        
        return {
          success: false,
          error: `Code validation failed after ${MAX_RETRIES} attempts: ${validation.errors.join(", ")}`
        };
      }
      
      return {
        success: true,
        code: validation.code,
        title
      };
    } catch (error) {
      if (retryCount < MAX_RETRIES - 1) {
        return generateLesson({ outline, retryCount: retryCount + 1 });
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  },
  { name: "generate_lesson", project_name: "lesson-generator" }
);
