import { prisma } from './db'
import type { Prisma } from '@prisma/client'

export type UsageOperation =
  | 'transcription'
  | 'summary'
  | 'wiki_generation'
  | 'chat'
  | 'character_parse'

interface TokenCounts {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

/**
 * Fire-and-forget token usage logger. Never throws — errors are logged silently.
 */
export async function trackUsage(
  userId: string,
  operation: UsageOperation,
  tokens: TokenCounts,
  campaignId?: string,
  metadata?: Prisma.InputJsonValue
): Promise<void> {
  try {
    await prisma.usageRecord.create({
      data: {
        userId,
        operation,
        promptTokens: tokens.promptTokens ?? 0,
        completionTokens: tokens.completionTokens ?? 0,
        totalTokens: tokens.totalTokens ?? 0,
        campaignId: campaignId ?? null,
        metadata: metadata ?? undefined,
      },
    })
  } catch (error) {
    console.error('Usage tracking error (non-fatal):', error)
  }
}

/**
 * Extract token counts from Gemini usageMetadata response.
 */
export function extractTokenCounts(usageMetadata: {
  promptTokenCount?: number
  candidatesTokenCount?: number
  totalTokenCount?: number
} | undefined): TokenCounts {
  if (!usageMetadata) return {}
  return {
    promptTokens: usageMetadata.promptTokenCount ?? 0,
    completionTokens: usageMetadata.candidatesTokenCount ?? 0,
    totalTokens: usageMetadata.totalTokenCount ?? 0,
  }
}
