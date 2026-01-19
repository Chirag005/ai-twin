import { defineEventHandler, readBody } from 'h3'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const server = new McpServer({
  name: 'chirag-portfolio-context',
  version: '1.0.0',
})

// Tool: Full resume
server.tool('get_resume', {}, async () => {
  const resume = readFileSync(join(process.cwd(), 'data/resume.md'), 'utf-8')
  return { content: [{ type: 'text', text: resume }] }
})

// Tool: Experience details
server.tool('get_experience', {}, async () => {
  const experience = readFileSync(join(process.cwd(), 'data/experience.md'), 'utf-8')
  return { content: [{ type: 'text', text: experience }] }
})

// Tool: Current projects
server.tool('get_current_projects', {}, async () => {
  const projects = readFileSync(join(process.cwd(), 'data/projects.md'), 'utf-8')
  return { content: [{ type: 'text', text: projects }] }
})

// Add more tools as needed (e.g., get_skills, get_linkedin_summary)

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    // MCP discovery/manifest
    return server.getManifest()
  }

  if (method === 'POST') {
    const body = await readBody(event)
    return await server.handle(body)
  }

  return { error: 'Method not allowed' }
})
