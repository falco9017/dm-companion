import { getGeminiFlash } from './client'
import { prisma } from '@/lib/db'
import { trackUsage } from '@/lib/usage-tracking'
import type { Prisma } from '@prisma/client'

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

  // If few results, also fetch recent session recaps for ambient campaign knowledge
  if (relevantEntries.length <= 1) {
    const recentRecaps = await prisma.wikiEntry.findMany({
      where: {
        campaignId,
        type: 'SESSION_RECAP',
        id: { notIn: relevantEntries.map((e) => e.id) },
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
    })
    relevantEntries.push(...recentRecaps)
  }

  if (relevantEntries.length === 0) {
    return 'No campaign wiki entries exist yet.'
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
  language = 'en',
  userId?: string,
  campaignId?: string
) {
  const { getLanguageLabel } = await import('./audio-processor')
  const langLabel = getLanguageLabel(language)
  const systemPrompt = `You are DM Companion, an experienced tabletop RPG assistant for game masters.

Your capabilities:
- Answer questions about the campaign using the wiki context below
- Generate creative content on demand: NPCs, locations, items, encounters, plot hooks
- When generating content, always include: a name, a brief description (2-3 sentences), and one peculiar or memorable trait
- Provide useful, descriptive answers — not one-liners, but not essays either
- If asked about campaign-specific info not in the wiki, say you don't have that info and offer to help create it

Always respond in ${langLabel}.

Campaign wiki context:
${context}`

  // Build messages for the chat
  const messages = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Ready.' }] },
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

  // Track usage after stream completes (fire-and-forget)
  if (userId) {
    result.response.then((res) => {
      const meta = res.usageMetadata
      if (meta) {
        trackUsage(userId, 'chat', {
          promptTokens: meta.promptTokenCount ?? 0,
          completionTokens: meta.candidatesTokenCount ?? 0,
          totalTokens: meta.totalTokenCount ?? 0,
        }, campaignId)
      }
    }).catch(() => {})
  }

  return result.stream
}

export async function saveChatMessage(
  campaignId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
  contextUsed?: Prisma.InputJsonValue
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
