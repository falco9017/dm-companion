'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="text-text-muted hover:text-text-secondary p-1 -ml-1 mb-3 transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
}
