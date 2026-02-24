import { createGroq } from '@ai-sdk/groq'
import { streamText, tool } from 'ai'
import { defineEventHandler, readBody } from 'h3'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { messages } = await readBody(event)

  // ── Log user question to Supabase (service role — bypasses RLS/auth) ─────
  // Fire-and-forget: never blocks or delays the streaming response.
  try {
    const supabaseUrl     = process.env.NUXT_PUBLIC_SUPABASE_URL
    const supabaseService = process.env.SUPABASE_SERVICE_KEY

    if (supabaseUrl && supabaseService) {
      const adminClient = createClient(supabaseUrl, supabaseService, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const user = await serverSupabaseUser(event).catch(() => null)
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')

      if (lastUserMsg) {
        const question = typeof lastUserMsg.content === 'string'
          ? lastUserMsg.content
          : '[multipart message with attachments]'

        adminClient.from('chat_logs').insert({
          user_id:    user?.id    ?? null,
          user_email: user?.email ?? 'anonymous',
          question,
        }).then(({ error }: { error: any }) => {
          if (error) console.error('[chat_logs] insert failed:', error.message)
          else console.log('[chat_logs] logged question from', user?.email ?? 'anonymous')
        })
      }
    } else {
      console.warn('[chat_logs] skipping — SUPABASE_SERVICE_KEY not set')
    }
  } catch (err) {
    // Never let logging crash the chat
    console.error('[chat_logs] unexpected error:', err)
  }


  // Normalise messages — each message content may be a string or an array of
  // content parts (text / image) sent from the multimodal frontend.
  const normalisedMessages = messages.map((m: any) => {
    if (typeof m.content === 'string') return m
    return m
  })

  const result = await streamText({
    model: createGroq({ apiKey: config.groqApiKey || process.env.GROQ_API_KEY })('llama-3.3-70b-versatile'),
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

