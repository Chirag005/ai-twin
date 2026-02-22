import { defineEventHandler, readBody } from 'h3'
import { PDFParse } from 'pdf-parse'

export default defineEventHandler(async (event) => {
  const { pdf } = await readBody(event)

  if (!pdf) {
    return { error: 'No PDF data provided', text: '' }
  }

  try {
    // Decode base64 → Buffer
    const buffer = Buffer.from(pdf, 'base64')
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy()
    
    return { text: result.text, pages: result.total }
  } catch (err) {
    console.error('[parse-pdf] Error:', err)
    return { error: 'Failed to parse PDF', text: '' }
  }
})
