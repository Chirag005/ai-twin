import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { experimental_createMCPClient } from 'ai'
import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  const mcpClient = await experimental_createMCPClient({
    transport: {
      type: 'http', // Works great on Vercel/Nitro
      url: `${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mcp`,
    },
  })

  const result = await streamText({
    model: openai('gpt-4o'), // Swap with groq(), anthropic(), etc.
    system: `You are Chirag's professional AI assistant.
You represent Chirag accurately, enthusiastically, and always professionally.
Only use information returned by the provided tools.
If you don't know something, politely say so and suggest visiting Chirag's LinkedIn or GitHub.
Use Markdown formatting when helpful (lists, bold, code blocks).`,
    messages,
    tools: mcpClient.tools(), // Auto-discovers all your tools
  })

  return result.toDataStreamResponse()
})
