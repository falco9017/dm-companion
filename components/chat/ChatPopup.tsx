'use client'

import { useState } from 'react'
import ChatInterface from './ChatInterface'

interface ChatPopupProps {
  campaignId: string
}

export default function ChatPopup({ campaignId }: ChatPopupProps) {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center text-2xl transition-colors"
        title="DM Companion"
      >
        &#128172;
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col transition-all ${
        minimized ? 'h-12' : 'h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 flex-shrink-0 rounded-t-xl bg-gray-800/50">
        <span className="text-sm font-semibold text-white">DM Companion</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-gray-400 hover:text-white px-1 text-lg"
            title={minimized ? 'Expand' : 'Minimize'}
          >
            {minimized ? '\u25B2' : '\u25BC'}
          </button>
          <button
            onClick={() => { setOpen(false); setMinimized(false) }}
            className="text-gray-400 hover:text-white px-1 text-lg"
            title="Close"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Chat body */}
      {!minimized && (
        <div className="flex-1 min-h-0">
          <ChatInterface campaignId={campaignId} />
        </div>
      )}
    </div>
  )
}
