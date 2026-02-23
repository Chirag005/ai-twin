import { groq } from '@ai-sdk/groq'
import { streamText, tool } from 'ai'
import { defineEventHandler, readBody } from 'h3'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  // Normalise messages — each message content may be a string or an array of
  // content parts (text / image) sent from the multimodal frontend.
  const normalisedMessages = messages.map((m: any) => {
    if (typeof m.content === 'string') return m
    // Already an array of parts — pass through directly (AI SDK handles it)
    return m
  })

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'), // Stable, high-limit free-tier model
    system: `You are Chirag's professional AI assistant.
You represent Chirag accurately, enthusiastically, and always professionally.
Only use information returned by the provided tools.
If you don't know something, politely say so and suggest visiting Chirag's LinkedIn or GitHub.
Use Markdown formatting when helpful (lists, bold, code blocks).
When the user attaches an image, analyse it in detail and relate it to Chirag's professional context where relevant.
When the user attaches a PDF document (provided as extracted text), read and summarise it clearly.`,
    messages: normalisedMessages,
    tools: {
      get_resume: tool({
        description: 'Get Chirag\'s complete resume including skills, education, certifications, and contact information',
        inputSchema: z.object({}),
        execute: async () => {
          const resume = readFileSync(join(process.cwd(), 'data/resume.md'), 'utf-8')
          return resume
        },
      }),
      get_experience: tool({
        description: 'Get detailed information about Chirag\'s work experience, including positions at SOLTECH, ANAMII, and Infosys',
        inputSchema: z.object({}),
        execute: async () => {
          const experience = readFileSync(join(process.cwd(), 'data/experience.md'), 'utf-8')
          return experience
        },
      }),
      get_current_projects: tool({
        description: 'Get information about Chirag\'s current and past projects including AI Twin, Brain Tumor Recognizer, Box-Ball-Arena, CUDA projects, and more',
        inputSchema: z.object({}),
        execute: async () => {
          const projects = readFileSync(join(process.cwd(), 'data/projects.md'), 'utf-8')
          return projects
        },
      }),
    },
  })

  return result.toTextStreamResponse()
})
