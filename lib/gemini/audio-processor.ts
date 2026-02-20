import { getGeminiPro, getGeminiFlash } from './client'
import { trackUsage, extractTokenCounts } from '@/lib/usage-tracking'

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  it: 'Italian',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
}

export function getLanguageLabel(code: string): string {
  return LANGUAGE_LABELS[code] || code
}

interface VoiceProfileInput {
  name: string
  role: string
  blobUrl: string
}

function detectMimeType(url: string): string {
  if (url.includes('.wav')) return 'audio/wav'
  if (url.includes('.m4a')) return 'audio/mp4'
  if (url.includes('.ogg')) return 'audio/ogg'
  if (url.includes('.webm')) return 'audio/webm'
  return 'audio/mpeg'
}

export async function transcribeAudio(
  audioUrl: string,
  voiceProfiles?: VoiceProfileInput[],
  userId?: string,
  campaignId?: string
): Promise<string> {
  try {
    // Fetch the session audio file
    const response = await fetch(audioUrl)
    const audioBuffer = await response.arrayBuffer()
    const audioData = Buffer.from(audioBuffer).toString('base64')
    const mimeType = detectMimeType(audioUrl)

    // Build the request parts
    const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = []

    // If voice profiles exist, add them first for speaker identification
    if (voiceProfiles && voiceProfiles.length > 0) {
      const voiceSampleLabels: string[] = []

      for (let i = 0; i < voiceProfiles.length; i++) {
        const profile = voiceProfiles[i]
        try {
          const sampleResponse = await fetch(profile.blobUrl)
          const sampleBuffer = await sampleResponse.arrayBuffer()
          const sampleData = Buffer.from(sampleBuffer).toString('base64')
          const sampleMimeType = detectMimeType(profile.blobUrl)

          voiceSampleLabels.push(`Voice sample ${i + 1}: ${profile.name} (${profile.role})`)

          parts.push({
            text: `[Voice sample ${i + 1}: ${profile.name} (${profile.role})]`,
          })
          parts.push({
            inlineData: {
              mimeType: sampleMimeType,
              data: sampleData,
            },
          })
        } catch (err) {
          console.error(`Failed to fetch voice sample for ${profile.name}:`, err)
        }
      }

      // Add session audio
      parts.push({
        text: '[Session recording to transcribe]',
      })
      parts.push({
        inlineData: { mimeType, data: audioData },
      })

      // Enhanced prompt with speaker identification instructions
      parts.push({
        text: `Please transcribe this audio recording from a tabletop RPG session.

SPEAKER IDENTIFICATION: I've provided voice samples for the people at the table.
Use these to identify who is speaking throughout the session recording.
${voiceSampleLabels.join('\n')}

Label each line of dialogue with the speaker's name. For the DM, also note
when they're speaking as themselves vs voicing an NPC (use "DM" for narration/DM
speech, and the NPC name when clearly doing a character voice if identifiable from context).

If you cannot confidently match a voice to a profile, use "Unknown Speaker".

Include all dialogue and narration. Be thorough and capture all important details,
character names, locations, events, and story beats.

IMPORTANT: Transcribe in the original language of the audio. Do not translate.`,
      })
    } else {
      // No voice profiles — use original behavior
      parts.push({
        inlineData: { mimeType, data: audioData },
      })
      parts.push({
        text: `Please transcribe this audio recording from a tabletop RPG (D&D, Pathfinder, etc.) session.

Include all dialogue and narration. Format the transcript clearly with speaker labels if possible.
Be thorough and capture all important details, character names, locations, events, and story beats.

IMPORTANT: Transcribe in the original language of the audio. Do not translate.`,
      })
    }

    // Transcribe using Gemini Pro
    const result = await getGeminiPro().generateContent(parts)

    // Track usage
    if (userId) {
      const tokens = extractTokenCounts(result.response.usageMetadata)
      trackUsage(userId, 'transcription', tokens, campaignId)
    }

    const transcription = result.response.text()
    return transcription
  } catch (error) {
    console.error('Transcription error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to transcribe audio: ${msg}`)
  }
}

export async function generateSummary(transcript: string, language = 'en', userId?: string, campaignId?: string): Promise<string> {
  try {
    const langLabel = getLanguageLabel(language)
    const result = await getGeminiFlash().generateContent(`
You are summarizing a tabletop RPG session transcript. Create a concise summary (2-3 paragraphs) that captures:
- Main story beats and plot developments
- Important character actions and decisions
- Key locations visited
- Notable NPCs encountered
- Any significant items found or quests accepted

IMPORTANT: Write the entire summary in ${langLabel}.

Transcript:
${transcript}

Summary:`)

    // Track usage
    if (userId) {
      const tokens = extractTokenCounts(result.response.usageMetadata)
      trackUsage(userId, 'summary', tokens, campaignId)
    }

    return result.response.text()
  } catch (error) {
    console.error('Summary generation error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to generate summary: ${msg}`)
  }
}
