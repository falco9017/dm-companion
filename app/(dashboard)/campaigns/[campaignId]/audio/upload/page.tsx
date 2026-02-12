import { auth } from '@/lib/auth'
import { getCampaign } from '@/actions/campaigns'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AudioUploader from '@/components/audio/AudioUploader'

export default async function UploadAudioPage({
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/campaigns/${campaignId}/audio`}
          className="text-purple-300 hover:text-purple-200 text-sm mb-2 inline-block"
        >
          ← Back to Audio Files
        </Link>
        <h1 className="text-3xl font-bold text-white">Upload Audio File</h1>
        <p className="text-slate-300 mt-2">
          Upload a session recording to automatically transcribe and generate wiki entries
        </p>
      </div>

      <AudioUploader campaignId={campaignId} />
    </div>
  )
}
