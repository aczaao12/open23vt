import { supabase } from './supabase'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.provider_token
  if (!token) throw new Error('No Google Drive access token')
  return token
}

async function ensureFolder(token: string): Promise<string> {
  const folderName = import.meta.env.VITE_DRIVE_FOLDER_NAME || 'open23VT_MinhChung'
  const query = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`)
  const res = await fetch(`${DRIVE_API}/files?q=${query}&spaces=drive`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (data.files?.length > 0) return data.files[0].id

  const createRes = await fetch(`${DRIVE_API}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  })
  const folder = await createRes.json()
  return folder.id
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  const token = await getAccessToken()
  await fetch(`${DRIVE_API}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function uploadToDrive(file: File, fileName: string): Promise<{ id: string; name: string; webViewLink: string }> {
  const token = await getAccessToken()
  const folderId = await ensureFolder(token)

  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  })

  const form = new FormData()
  form.append('metadata', new Blob([metadata], { type: 'application/json' }))
  form.append('file', file)

  const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Upload to Drive failed')
  }

  return res.json()
}
