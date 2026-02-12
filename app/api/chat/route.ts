import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { buildChatContext, getChatCompletion, saveChatMessage } from '@/lib/gemini/chat'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, campaignId, history } = await request.json()

    if (!message || !campaignId) {
      return new Response('Missing message or campaignId', { status: 400 })
    }

    // Build context from wiki
    const context = await buildChatContext(campaignId, message)

    // Save user message
    await saveChatMessage(campaignId, session.user.id, 'user', message)

    // Get streaming completion
    const stream = await getChatCompletion(context, message, history || [])

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text()
            fullResponse += text
            controller.enqueue(encoder.encode(text))
          }

          // Save assistant response
          await saveChatMessage(
            campaignId,
            session.user.id,
            'assistant',
            fullResponse,
            { context }
          )

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Chat failed', { status: 500 })
  }
}
