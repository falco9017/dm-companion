import { getGeminiFlash } from './client'
import { prisma } from '@/lib/db'

export async function buildChatContext(
  campaignId: string,
  userQuery: string
): Promise<string> {
  // Search for relevant wiki entries based on the query
  const relevantEntries = await prisma.wikiEntry.findMany({
    where: {
      campaignId,
      OR: [
        { title: { contains: userQuery, mode: 'insensitive' } },
        { content: { contains: userQuery, mode: 'insensitive' } },
        { tags: { hasSome: userQuery.toLowerCase().split(' ') } },
      ],
    },
    take: 5,
    orderBy: { updatedAt: 'desc' },
  })

  if (relevantEntries.length === 0) {
    return 'No specific campaign information found for this query.'
  }

  // Build context from wiki entries
  let context = 'Here is relevant information from the campaign wiki:\n\n'

  for (const entry of relevantEntries) {
    context += `## ${entry.title} (${entry.type})\n`
    context += `${entry.content}\n\n`
  }

  return context
}

export async function getChatCompletion(
  context: string,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  language = 'en'
) {
  const { getLanguageLabel } = await import('./audio-processor')
  const langLabel = getLanguageLabel(language)
  const systemPrompt = `You are a helpful AI assistant for a tabletop RPG campaign management tool.
You have access to the campaign's wiki which contains information about characters, locations, events, NPCs, items, quests, and session recaps.

When answering questions:
- Use the provided context from the campaign wiki
- Be specific and reference the information you have
- If information isn't in the context, say so
- Help the user recall details from their sessions
- Be conversational and enthusiastic about their campaign
- IMPORTANT: Always respond in ${langLabel}

Context from campaign wiki:
${context}`

  // Build messages for the chat
  const messages = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood! I\'m ready to help with your campaign.' }] },
  ]

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })
  }

  // Add current user message
  messages.push({
    role: 'user',
    parts: [{ text: userMessage }],
  })

  // Generate response
  const chat = getGeminiFlash().startChat({
    history: messages.slice(0, -1),
  })

  const result = await chat.sendMessageStream(userMessage)
  return result.stream
}

export async function saveChatMessage(
  campaignId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  contextUsed?: any
) {
  return await prisma.chatMessage.create({
    data: {
      role,
      content,
      contextUsed,
      campaignId,
      userId,
    },
  })
}

export async function getChatHistory(campaignId: string, limit = 20) {
  return await prisma.chatMessage.findMany({
    where: { campaignId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
