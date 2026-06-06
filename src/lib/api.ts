import { supabase } from './supabase'
import type { Activity, Submission, Profile, Semester, StorageConfig } from '@/types/database'

/* ---- Profiles ---- */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }) {
  return supabase.from('profiles').upsert(profile)
}

/* ---- Semesters ---- */
export async function getSemesters(): Promise<Semester[]> {
  const { data } = await supabase.from('semesters').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function getActiveSemester(): Promise<Semester | null> {
  const { data } = await supabase.from('semesters').select('*').eq('is_active', true).maybeSingle()
  return data
}

export async function createSemester(code: string) {
  return supabase.from('semesters').insert({ code }).select('*').single()
}

export async function updateSemester(id: string, code: string) {
  return supabase.from('semesters').update({ code }).eq('id', id)
}

export async function deleteSemester(id: string) {
  return supabase.from('semesters').delete().eq('id', id)
}

export async function setActiveSemester(id: string) {
  // Unset current active, then set new one — run sequentially
  await supabase.from('semesters').update({ is_active: false }).eq('is_active', true)
  return supabase.from('semesters').update({ is_active: true }).eq('id', id)
}

/* ---- Activities ---- */
export async function getActivities(semesterId?: string): Promise<Activity[]> {
  let query = supabase.from('activities').select('*, semester:semesters(*)')
  if (semesterId) query = query.eq('semester_id', semesterId)
  const { data } = await query.order('created_at', { ascending: false })
  return data || []
}

export async function getActivity(id: string): Promise<Activity | null> {
  const { data } = await supabase.from('activities').select('*, semester:semesters(*)').eq('id', id).single()
  return data
}

export async function createActivity(activity: Pick<Activity, 'name' | 'description' | 'points' | 'semester_id'>) {
  return supabase.from('activities').insert(activity).select('*, semester:semesters(*)').single()
}

export async function updateActivity(id: string, activity: Partial<Pick<Activity, 'name' | 'description' | 'points' | 'semester_id'>>) {
  return supabase.from('activities').update(activity).eq('id', id)
}

export async function deleteActivity(id: string) {
  return supabase.from('activities').delete().eq('id', id)
}

/* ---- Submissions ---- */
export async function getSubmissions(userId: string, semesterId?: string): Promise<Submission[]> {
  let query = supabase
    .from('submissions')
    .select('*, activity:activities(*), semester:semesters(*)')
    .eq('user_id', userId)
  if (semesterId) query = query.eq('semester_id', semesterId)
  const { data } = await query.order('submitted_at', { ascending: false })
  return data || []
}

export async function getAllSubmissions(semesterId?: string): Promise<Submission[]> {
  let query = supabase
    .from('submissions')
    .select('*, activity:activities(*), profile:profiles!user_id(*), semester:semesters(*)')
  if (semesterId) query = query.eq('semester_id', semesterId)
  const { data, error } = await query.order('submitted_at', { ascending: false })
  if (error) console.error('getAllSubmissions error:', JSON.stringify(error, null, 2), error)
  return data || []
}

export async function getPendingSubmissions(semesterId?: string): Promise<Submission[]> {
  let query = supabase
    .from('submissions')
    .select('*, activity:activities(*), profile:profiles!user_id(*), semester:semesters(*)')
    .eq('status', 'pending')
  if (semesterId) query = query.eq('semester_id', semesterId)
  const { data, error } = await query.order('submitted_at', { ascending: false })
  if (error) console.error('getPendingSubmissions error:', JSON.stringify(error, null, 2), error)
  return data || []
}

export async function getSubmission(activityId: string, userId: string): Promise<Submission | null> {
  const { data } = await supabase
    .from('submissions')
    .select('*, activity:activities(*), semester:semesters(*)')
    .eq('activity_id', activityId)
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

export async function createSubmission(submission: {
  user_id: string
  activity_id: string
  semester_id?: string | null
  image_drive_id: string
  image_name: string
  image_url: string | null
  storage_type?: string
  supabase_path?: string | null
}) {
  return supabase.from('submissions').insert(submission).select('*, semester:semesters(*)').single()
}

export async function updateSubmission(id: string, updates: {
  image_drive_id?: string
  image_name?: string
  image_url?: string | null
  storage_type?: string
  supabase_path?: string | null
}) {
  return supabase.from('submissions').update(updates).eq('id', id)
}

export async function deleteSubmission(id: string) {
  return supabase.from('submissions').delete().eq('id', id)
}

export async function reviewSubmission(id: string, status: 'approved' | 'rejected', reviewedBy: string, notes?: string) {
  return supabase
    .from('submissions')
    .update({ status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString(), notes })
    .eq('id', id)
}

/* ---- Storage Config ---- */
export async function getStorageConfig(): Promise<StorageConfig | null> {
  const { data } = await supabase.from('storage_config').select('*').maybeSingle()
  return data
}

export async function updateStorageConfig(config: { storage_backend: 'drive' | 'supabase' }, updatedBy: string) {
  const { data: existing } = await supabase.from('storage_config').select('id').maybeSingle()
  if (existing) {
    const { error } = await supabase
      .from('storage_config')
      .update({ ...config, updated_at: new Date().toISOString(), updated_by: updatedBy })
      .eq('id', existing.id)
    if (error) throw error
    return
  }
  const { error } = await supabase
    .from('storage_config')
    .insert({ ...config, updated_by: updatedBy })
    .select('*')
    .single()
  if (error) throw error
}
