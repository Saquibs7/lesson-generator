# AI Lesson Generator

A full-stack application that generates interactive educational lessons using AI. Built with Next.js, TypeScript, Supabase, and OpenAI GPT-4.

## Features

- **AI-Powered Generation**: Uses Google Gemini to generate complete TypeScript React components
- **Real-time Updates**: Automatic polling for lesson generation status without page refreshes
- **TypeScript Safety**: Robust validation and error handling with automatic retry logic
- **LangSmith Tracing**: Complete observability of AI workflows with LangSmith integration
- **Interactive Lessons**: Generated lessons include quizzes, explanations, and interactive elements
- **Beautiful UI**: Modern, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 1.5 Pro
- **Tracing**: LangSmith
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

## Usage

1. **Generate a Lesson**:

   - Enter a lesson outline in the text area (e.g., "A 10 question pop quiz on Florida")
   - Click "Generate Lesson"
   - Watch the status in the table below

2. **View a Lesson**:
   - Once generated, click "View Lesson" to see the interactive content
   - The AI generates a complete TypeScript React component that renders in your browser

### Example Lesson Outlines

- "A 10 question pop quiz on Florida"
- "A one-pager on how to divide with long division"
- "An explanation of how the Cartesian Grid works and an example of finding distances between points"
- "A test on counting numbers"
- "An interactive tutorial on basic algebra"

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Deploy to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables from `.env.local`
   - Deploy!

3. **Update Supabase CORS** (if needed):
   - Go to your Supabase project settings
   - Add your Vercel domain to allowed origins

### LangSmith Tracing Access

To grant tracing access to the team:

1. Go to [https://smith.langchain.com](https://smith.langchain.com)
2. Navigate to your project settings
3. Invite the following emails with "Viewer" role:
   - k@freestand.in
   - sushant@freestand.in
   - abhishek.d@freestand.in
   - pratik@freestand.in

## Architecture

### Generation Pipeline

1. **User Input**: User submits a lesson outline
2. **Database Record**: Create initial lesson record with "generating" status
3. **Background Job**: Trigger async AI generation
4. **Title Extraction**: GPT-4 mini extracts a concise title
5. **Code Generation**: GPT-4o generates complete TypeScript component
6. **Validation**: Multi-step validation with automatic retry (up to 3 attempts)
7. **Error Correction**: If validation fails, GPT-4o attempts to fix the code
8. **Database Update**: Update lesson with generated content or error
9. **Client Polling**: Frontend polls for status updates every 2 seconds

### Reliability Features

- **Automatic Retries**: Up to 3 attempts for generation and validation
- **Code Validation**: Checks for proper React structure, balanced syntax, and dangerous patterns
- **Error Recovery**: AI-powered code fixing when validation fails
- **Graceful Degradation**: Clear error messages and status tracking

### LangSmith Tracing

All AI operations are traced with LangSmith:

- Title extraction
- Code generation attempts
- Validation and fixing steps
- Complete end-to-end workflow

View traces at: [https://smith.langchain.com](https://smith.langchain.com)

## Development

### Project Structure

```
lesson-generator/
├── app/
│   ├── api/
│   │   └── lessons/
│   │       ├── route.ts              # GET all lessons
│   │       ├── [id]/route.ts         # GET single lesson
│   │       └── generate/route.ts     # POST generate lesson
│   ├── lessons/
│   │   └── [id]/page.tsx            # Lesson view page
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
├── components/
│   └── ui/                           # Shadcn UI components
├── lib/
│   ├── lesson-generator.ts           # AI generation logic
│   ├── types.ts                      # TypeScript types & validation
│   └── supabase/                     # Supabase clients
├── supabase/
│   └── migrations/
│       └── 001_create_lessons_table.sql
└── .env.local                        # Environment variables
```

### Key Files

- `lib/lesson-generator.ts`: Core AI generation with LangSmith tracing
- `lib/types.ts`: Type definitions and code validation
- `app/api/lessons/generate/route.ts`: API endpoint for lesson generation
- `app/lessons/[id]/page.tsx`: Dynamic component rendering

## Troubleshooting

### Lesson generation fails

- Check OpenAI API key is valid and has credits
- Check LangSmith traces for detailed error information
- Verify the outline is clear and specific

### Component won't render

- Check browser console for errors
- Verify the generated code in the database
- Check that React is loaded globally (in layout.tsx)

### Database connection issues

- Verify Supabase URL and anon key
- Check that the migration was run successfully
- Verify RLS policies are set correctly

## Future Enhancements

- [ ] Add SVG generation for diagrams
- [ ] Integrate AI-generated images
- [ ] Support for multiple lesson templates
- [ ] Export lessons as standalone files
- [ ] Lesson sharing and collaboration
- [ ] Version history for generated lessons

## License

MIT

## Support

For issues or questions, please check:

1. LangSmith traces for AI generation details
2. Browser console for client-side errors
3. Vercel logs for server-side errors
