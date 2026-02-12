import { auth } from '@/lib/auth'
import { getAudioFiles } from '@/actions/audio'
import { getCampaign } from '@/actions/campaigns'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function AudioPage({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params
  const session = await auth()
  const campaign = await getCampaign(campaignId, session!.user.id)

  if (!campaign) {
    notFound()
  }

  const audioFiles = await getAudioFiles(campaignId, session!.user.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return 'text-green-400'
      case 'PROCESSING':
        return 'text-yellow-400'
      case 'FAILED':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href={`/campaigns/${campaignId}`}
            className="text-purple-300 hover:text-purple-200 text-sm mb-2 inline-block"
          >
            ← Back to Campaign
          </Link>
          <h1 className="text-3xl font-bold text-white">Audio Files</h1>
        </div>
        <Link
          href={`/campaigns/${campaignId}/audio/upload`}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Upload Audio
        </Link>
      </div>

      {audioFiles.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-12 text-center">
          <p className="text-slate-300 text-lg mb-4">No audio files yet</p>
          <Link
            href={`/campaigns/${campaignId}/audio/upload`}
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Upload Your First Audio File
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {audioFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {file.filename}
                  </h3>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    <span className={getStatusColor(file.status)}>
                      {file.status}
                    </span>
                    <span>
                      {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {file.summary && (
                    <p className="text-slate-300 text-sm mt-2 line-clamp-2">
                      {file.summary}
                    </p>
                  )}
                </div>
                {file.status === 'UPLOADED' && (
                  <Link
                    href={`/api/audio/process?id=${file.id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded transition-colors"
                  >
                    Process
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
