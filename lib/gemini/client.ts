import { GoogleGenerativeAI } from '@google/generative-ai'

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined')
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

// Gemini 1.5 Pro for audio transcription
export function getGeminiPro() {
  return getGenAI().getGenerativeModel({ model: 'gemini-1.5-pro' })
}

// Gemini Flash for chat and quick tasks
export function getGeminiFlash() {
  return getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' })
}
