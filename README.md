# Digitail Lesson Generator 
### link : https://lesson-generator-seven.vercel.app/

A full-stack application that generates diverse interactive educational content using AI. Built with Next.js, TypeScript, Supabase, and Google Gemini. Create engaging lessons ranging from interactive tutorials with diagrams to comprehensive quizzes.

## Features

### 🤖 AI-Powered Content Generation
- **Interactive Lessons**: Educational content with visual diagrams, expandable sections, and structured explanations
- **Quiz Generation**: Paginated quizzes with next/previous navigation and instant scoring
- **Mixed Content**: Combination of learning materials and practice questions
- **Smart Compilation**: TypeScript to JavaScript compilation in secure iframe sandbox
### 🔒 Security & Performance

- **Rate Limiting**: 5 lesson generations/minute, 30 compilations/minute
- **Sandbox Execution**: Generated code runs in isolated iframe
- **Safe Navigation**: PostMessage API for cross-frame communication
- **TypeScript Validation**: Multi-step validation with automatic retry logic

### 📊 Observability

- **LangSmith Tracing**: Complete visibility into AI workflows
- **Error Tracking**: Detailed error messages and recovery flows
- **Performance Monitoring**: Request/response timing and status codes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with rate limiting
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **Compilation**: TypeScript Compiler API
- **Tracing**: LangSmith
- **Package Manager**: Bun
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Supabase account ([https://supabase.com](https://supabase.com))
- A Google Gemini API key ([https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))
- A LangSmith account for tracing ([https://smith.langchain.com](https://smith.langchain.com))

### Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone <your-repo-url>
   cd lesson-generator
   ```

2. **Install dependencies**:

   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up Supabase**:

   - Create a new project at [https://supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Go to SQL Editor and run the migration file:
     ```sql
     -- Copy and paste the contents of supabase/migrations/001_create_lessons_table.sql
     ```

4. **Configure environment variables**:

   Update `.env.local` with your credentials:

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

   # Google Gemini
   GEMINI_API_KEY=your-gemini-api-key

   # LangSmith (for tracing)
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_API_KEY=your-langsmith-api-key
   LANGCHAIN_PROJECT=lesson-generator
   ```

5. **Run the development server**:

   ```bash
   bun dev
   # or
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage

### 1. Generate a Lesson

Enter a lesson outline and click "Generate Lesson". The AI will create interactive content based on your request:

**For Interactive Lessons** (explanations, tutorials, concepts):

- "Explain how photosynthesis works with diagrams"
- "Interactive lesson on the water cycle with key concepts"
- "Understanding JavaScript variables with examples"
- "The Pythagorean theorem explained step-by-step"

**For Quizzes** (assessments, tests):

- "A 10 question pop quiz on World War 2"
- "Test my knowledge on the solar system"
- "5 question quiz about Shakespeare"

**For Mixed Content** (learning + practice):

- "Learn about fractions with examples and a 5 question quiz"
- "Introduction to Python programming with practice exercises"

### 2. Watch the Status

- ⏳ **Generating**: AI is creating your lesson (automatic updates)
- ✅ **Generated**: Lesson is ready to view
- ❌ **Failed**: Generation encountered an error

### 3. View & Interact

Click "View Lesson" to:

- Explore interactive content with expandable sections
- View visual diagrams and concept boxes
- Take paginated quizzes with instant feedback
- Navigate back home or retry quizzes

### LangSmith Tracing Access

To grant tracing access to the team:

1. Go to [https://smith.langchain.com](https://smith.langchain.com)
2. Navigate to your project settings
3. Invite the following emails with "Viewer" role:
   - k@freestand.in
   - sushant@freestand.in
   - abhishek.d@freestand.in
   - pratik@freestand.in

### Generation Pipeline

1. **Rate Limit Check**: Verify user hasn't exceeded 5 generations/minute
2. **User Input**: User submits a lesson outline
3. **Database Record**: Create initial lesson record with "generating" status
4. **Background Job**: Trigger async AI generation
5. **Title Extraction**: Gemini extracts a concise title
6. **Code Generation**: Gemini generates complete TypeScript component with adaptive content:
   - Interactive lessons with diagrams and expandable sections
   - Paginated quizzes with navigation and scoring
   - Mixed content combining learning and practice
7. **Validation**: Multi-step validation with automatic retry (up to 3 attempts)
8. **Error Correction**: If validation fails, Gemini attempts to fix the code
9. **Database Update**: Update lesson with generated content or error
10. **Client Polling**: Frontend polls for status updates every 3 seconds (only when generating)

### Rendering Pipeline

1. **Compilation Request**: Rate-limited (30/minute) TypeScript compilation
2. **Code Transformation**: Remove imports, exports, and "use client" directives
3. **TypeScript Compilation**: Transpile to JavaScript using TypeScript Compiler API
4. **Sandbox Execution**: Load compiled code in iframe with `allow-scripts allow-top-navigation`
5. **React Rendering**: Component renders with React 18 from CDN
6. **PostMessage Communication**: Safe navigation back to home via message passing

## 🎯 Future Enhancements

- [ ] **Distributed Rate Limiting**: Replace in-memory Map with Redis/Vercel KV for multi-instance deployments
- [ ] **SVG Generation**: AI-generated custom diagrams tailored to lesson content
- [ ] **Image Integration**: AI-generated images for visual enhancement
- [ ] **Lesson Templates**: Pre-built templates for common subjects (math, science, history, etc.)
- [ ] **Export Functionality**: Download lessons as standalone HTML files or PDFs
- [ ] **User Accounts**: Authentication system for lesson ownership and management
- [ ] **Sharing & Collaboration**: Share lessons via unique URLs, collaborative editing
- [ ] **Version History**: Track and restore previous versions of lessons
- [ ] **Analytics**: Track lesson usage, completion rates, quiz performance
- [ ] **Multi-language**: Generate lessons in different languages
- [ ] **Accessibility**: Enhanced ARIA labels, keyboard navigation, screen reader support
- [ ] **Caching**: Cache compiled TypeScript for faster subsequent loads