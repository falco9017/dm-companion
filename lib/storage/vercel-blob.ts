import { put, del } from '@vercel/blob'

export async function uploadAudioToBlob(file: File, filename: string) {
  const blob = await put(filename, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })

  return {
    url: blob.url,
    key: blob.pathname,
  }
}

export async function deleteAudioFromBlob(url: string) {
  await del(url, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}
