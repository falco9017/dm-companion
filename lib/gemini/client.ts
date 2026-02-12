import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined')
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Gemini 1.5 Pro for audio transcription
export const geminiPro = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

// Gemini Flash for chat and quick tasks
export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
