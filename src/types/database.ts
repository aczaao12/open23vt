export type Role = 'user' | 'admin'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'
export type StorageType = 'drive' | 'supabase'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  birthday: string | null
  gender: string | null
  hometown: string | null
  position: string | null
  created_at: string
}

export interface Semester {
  id: string
  code: string
  is_active: boolean
  created_at: string
}

export interface Activity {
  id: string
  name: string
  description: string | null
  points: number
  semester_id: string | null
  created_at: string
  updated_at: string
  semester?: Semester
}

export interface Submission {
  id: string
  user_id: string
  activity_id: string
  semester_id: string | null
  image_drive_id: string
  image_name: string
  image_url: string | null
  storage_type: StorageType
  supabase_path: string | null
  status: SubmissionStatus
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  notes: string | null
  activity?: Activity
  profile?: Profile
  semester?: Semester
}

export interface DriveFile {
  id: string
  name: string
  webViewLink: string | null
  webContentLink: string | null
}

export interface StorageConfig {
  id: string
  storage_backend: StorageType
  updated_at: string
  updated_by: string | null
}
