import { supabase } from './supabase'
import { uploadToDrive as driveUpload, deleteFromDrive as driveDelete } from './drive'
import { getStorageConfig } from './api'
import type { StorageType, Submission } from '@/types/database'

const BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'minhchung'

interface UploadResult {
  storageType: StorageType
  driveId?: string
  driveUrl?: string
  supabasePath?: string
  supabaseUrl?: string
  fileName: string
}

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('No Supabase access token')
  return token
}

async function uploadToSupabase(file: File, fileName: string, userId: string): Promise<{ path: string; url: string }> {
  const token = await getAccessToken()
  const path = `${userId}/${fileName}`
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': file.type || 'application/octet-stream',
      'cache-control': '3600',
      'x-upsert': 'true',
    },
    body: file,
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Upload to Supabase thất bại (${res.status}): ${errBody}`)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

async function deleteFromSupabase(path: string): Promise<void> {
  const token = await getAccessToken()
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function deleteFile(submission: Submission): Promise<void> {
  if (submission.storage_type === 'drive' && submission.image_drive_id) {
    await driveDelete(submission.image_drive_id)
  } else if (submission.storage_type === 'supabase' && submission.supabase_path) {
    await deleteFromSupabase(submission.supabase_path)
  }
}

export async function uploadFile(
  file: File,
  fileName: string,
  userId: string
): Promise<UploadResult> {
  const config = await getStorageConfig()
  const backend = config?.storage_backend || 'drive'

  if (backend === 'drive') {
    const driveResult = await driveUpload(file, fileName)
    return {
      storageType: 'drive',
      driveId: driveResult.id,
      driveUrl: driveResult.webViewLink,
      fileName: driveResult.name,
    }
  }

  const supabaseResult = await uploadToSupabase(file, fileName, userId)
  return {
    storageType: 'supabase',
    supabasePath: supabaseResult.path,
    supabaseUrl: supabaseResult.url,
    fileName,
  }
}
