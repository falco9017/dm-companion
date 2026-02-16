import { getGeminiPro, getGeminiFlash } from './client'

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  it: 'Italian',
}

export function getLanguageLabel(code: string): string {
  return LANGUAGE_LABELS[code] || code
}

export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    // Fetch the audio file
    const response = await fetch(audioUrl)
    const audioBuffer = await response.arrayBuffer()
    const audioData = Buffer.from(audioBuffer).toString('base64')

    // Determine MIME type from URL
    let mimeType = 'audio/mpeg'
    if (audioUrl.includes('.wav')) mimeType = 'audio/wav'
    else if (audioUrl.includes('.m4a')) mimeType = 'audio/mp4'
    else if (audioUrl.includes('.ogg')) mimeType = 'audio/ogg'

    // Transcribe using Gemini Pro
    const result = await getGeminiPro().generateContent([
      {
        inlineData: {
          mimeType,
          data: audioData,
        },
      },
      {
        text: `Please transcribe this audio recording from a tabletop RPG (D&D, Pathfinder, etc.) session.

Include all dialogue and narration. Format the transcript clearly with speaker labels if possible.
Be thorough and capture all important details, character names, locations, events, and story beats.

IMPORTANT: Transcribe in the original language of the audio. Do not translate.`,
      },
    ])

    const transcription = result.response.text()
    return transcription
  } catch (error) {
    console.error('Transcription error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to transcribe audio: ${msg}`)
  }
}

export async function generateSummary(transcript: string, language = 'en'): Promise<string> {
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

    return result.response.text()
  } catch (error) {
    console.error('Summary generation error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to generate summary: ${msg}`)
  }
}
