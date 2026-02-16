import { GoogleGenerativeAI } from '@google/generative-ai'

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined')
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

// Gemini 2.5 Flash for audio transcription (1.5 models are retired)
export function getGeminiPro() {
  return getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' })
}

// Gemini 2.5 Flash for chat and quick tasks
export function getGeminiFlash() {
  return getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' })
}
