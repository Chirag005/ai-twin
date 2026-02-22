import { defineEventHandler, getRequestHeader, setResponseStatus } from 'h3'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Build the MCP server once (module-level singleton)
function createMcpServer() {
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

  return server
}

const mcpServer = createMcpServer()

export default defineEventHandler(async (event) => {
  const req = event.node.req
  const res = event.node.res

  // Create a stateless transport per-request
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  })

  try {
    await mcpServer.connect(transport)
    await transport.handleRequest(req, res)
  } catch (err) {
    if (!res.headersSent) {
      setResponseStatus(event, 500)
      return { error: 'MCP server error' }
    }
  }
})
