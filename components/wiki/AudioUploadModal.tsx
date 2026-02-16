'use client'

import AudioUploader from '@/components/audio/AudioUploader'

interface AudioUploadModalProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
}

export default function AudioUploadModal({ campaignId, isOpen, onClose }: AudioUploadModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Session Recording</h2>
            <p className="text-gray-400 text-sm mt-1">
              Upload audio to auto-transcribe and generate wiki entries
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>
        <div className="p-6">
          <AudioUploader campaignId={campaignId} />
        </div>
      </div>
    </div>
  )
}
