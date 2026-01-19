# AI Twin - Intelligent Portfolio Assistant

An AI-powered portfolio using **MCP (Model Context Protocol)** to provide intelligent, context-aware responses about Chirag's professional background.

## Features

- 🤖 **AI Chat Interface** - Interactive chat powered by OpenAI/Anthropic/Groq
- 🧠 **MCP Knowledge Tools** - Resume, experience, and project information accessible via tools
- 📝 **Markdown Support** - Rich formatting in responses
- ⚡ **Real-time Streaming** - Instant AI responses with streaming

## Tech Stack

- **Nuxt.js 4** - Full-stack framework
- **AI SDK** - LLM integration and streaming
- **MCP Server** - Knowledge management protocol
- **TailwindCSS** - Styling
- **TypeScript** - Type safety

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Add your OpenAI API key to `.env`:

   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. **Customize your data:**
   Edit the markdown files in the `data/` directory:
   - `data/resume.md` - Your resume and skills
   - `data/experience.md` - Work experience
   - `data/projects.md` - Current and past projects

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
ai-twin/
├── data/               # Knowledge base (markdown files)
│   ├── resume.md
│   ├── experience.md
│   └── projects.md
├── server/
│   └── api/
│       ├── mcp/        # MCP server implementation
│       │   └── [...slug].ts
│       └── chat.post.ts # Chat API endpoint
├── pages/
│   └── index.vue       # Chat interface
└── nuxt.config.ts
```

## How It Works

1. **User asks a question** in the chat interface
2. **AI SDK** sends the query to the MCP client
3. **MCP Server** provides relevant tools (get_resume, get_experience, get_current_projects)
4. **LLM** uses these tools to gather context and formulates a response
5. **Response is streamed** back to the user in real-time

## Customization

### Change AI Provider

Edit `server/api/chat.post.ts`:

```typescript
// Use Anthropic
import { anthropic } from "@ai-sdk/anthropic";
model: anthropic("claude-3-5-sonnet-20241022");

// Use Groq
import { groq } from "@ai-sdk/groq";
model: groq("llama-3.3-70b-versatile");
```

### Add More Tools

Add new tools in `server/api/mcp/[...slug].ts`:

```typescript
server.tool("get_skills", {}, async () => {
  const skills = readFileSync(join(process.cwd(), "data/skills.md"), "utf-8");
  return { content: [{ type: "text", text: skills }] };
});
```

## Deployment

Deploy to Vercel, Netlify, or any Node.js hosting:

```bash
npm run build
```

Make sure to set your environment variables in your hosting platform.

## License

MIT
