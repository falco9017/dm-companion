import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'
import { GoogleAICacheManager } from '@google/generative-ai/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/db'

const MODEL_NAME = 'gemini-2.5-flash'
// Gemini requires at least 32,768 tokens for caching (~4 chars per token)
const MIN_CACHE_CHARS = 130_000
const CACHE_TTL_SECONDS = 3600 // 1 hour

interface CacheResult {
  model: GenerativeModel
  usedCache: boolean
}

function getApiKey(): string {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined')
  }
  return process.env.GEMINI_API_KEY
}

function hashContent(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

export async function getModelWithCachedRecaps(
  campaignId: string,
  recapText: string
): Promise<CacheResult> {
  const apiKey = getApiKey()
  const genAI = new GoogleGenerativeAI(apiKey)

  // Below minimum token threshold — skip caching
  if (recapText.length < MIN_CACHE_CHARS) {
    return {
      model: genAI.getGenerativeModel({ model: MODEL_NAME }),
      usedCache: false,
    }
  }

  const contentHash = hashContent(recapText)

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { geminiCacheName: true, geminiCacheExpiry: true, geminiCacheHash: true },
    })

    // Cache hit: hash matches and not expired
    if (
      campaign?.geminiCacheName &&
      campaign.geminiCacheHash === contentHash &&
      campaign.geminiCacheExpiry &&
      campaign.geminiCacheExpiry > new Date()
    ) {
      const cacheManager = new GoogleAICacheManager(apiKey)
      const cachedContent = await cacheManager.get(campaign.geminiCacheName)
      const model = genAI.getGenerativeModelFromCachedContent(cachedContent)
      console.log(`[cache] Hit for campaign ${campaignId}`)
      return { model, usedCache: true }
    }

    // Cache miss or expired — create new cache
    const cacheManager = new GoogleAICacheManager(apiKey)
    const cachedContent = await cacheManager.create({
      model: `models/${MODEL_NAME}`,
      contents: [
        {
          role: 'user',
          parts: [{ text: recapText }],
        },
      ],
      systemInstruction: 'You are a wiki generator for a tabletop RPG campaign. The cached content contains all session recaps for this campaign.',
      ttlSeconds: CACHE_TTL_SECONDS,
    })

    // Store cache metadata
    const expiry = new Date(Date.now() + CACHE_TTL_SECONDS * 1000)
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        geminiCacheName: cachedContent.name,
        geminiCacheExpiry: expiry,
        geminiCacheHash: contentHash,
      },
    })

    const model = genAI.getGenerativeModelFromCachedContent(cachedContent)
    console.log(`[cache] Created for campaign ${campaignId}`)
    return { model, usedCache: true }
  } catch (error) {
    console.error(`[cache] Error for campaign ${campaignId}, falling back:`, error)
    return {
      model: genAI.getGenerativeModel({ model: MODEL_NAME }),
      usedCache: false,
    }
  }
}
