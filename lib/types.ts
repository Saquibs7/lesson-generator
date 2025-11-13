import { z } from "zod";

// Lesson database schema
export const LessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  outline: z.string(),
  status: z.enum(["generating", "generated", "failed"]),
  generated_content: z.string().nullable(),
  error_message: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Lesson = z.infer<typeof LessonSchema>;

// TypeScript code validation
export function validateTypeScriptCode(code: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check for required React component structure
  if (!code.includes("export default function")) {
    errors.push("Missing default export function");
  }
  
  // Check for proper JSX return
  if (!code.includes("return (") && !code.includes("return(")) {
    errors.push("Missing return statement");
  }
  
  // Check for dangerous patterns
  if (code.includes("eval(") || code.includes("Function(")) {
    errors.push("Contains dangerous code execution patterns");
  }
  
  // Check for import statements that might fail
  if (code.includes("import") && !code.includes("'react'") && !code.includes('"react"')) {
    errors.push("Contains unsupported import statements");
  }
  
  // Basic syntax checks
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push("Unbalanced braces");
  }
  
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push("Unbalanced parentheses");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
