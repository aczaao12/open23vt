import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, createSubmission } from '@/lib/api'
import { uploadFile } from '@/lib/storage'
import { normalizeFileName, getImageExt } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useActiveSemester } from '@/hooks/useSemester'
import type { Activity } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function Submit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeSemester } = useActiveSemester()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [renamed, setRenamed] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getActivity(id).then((a) => {
      setActivity(a)
      setLoading(false)
    })
  }, [id])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f || !activity) return
    setFile(f)
    setError('')
    const ext = getImageExt(f)
    setRenamed(normalizeFileName(activity.name, ext))
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function handleSubmit() {
    if (!file || !user || !activity) return
    setSubmitting(true)
    setError('')

    try {
      const result = await uploadFile(file, renamed, user.id)
      await createSubmission({
        user_id: user.id,
        activity_id: activity.id,
        semester_id: activeSemester?.id || null,
        image_drive_id: result.driveId || '',
        image_name: result.fileName,
        image_url: result.driveUrl || result.supabaseUrl || null,
        storage_type: result.storageType,
        supabase_path: result.supabasePath || null,
      })
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Không tìm thấy hoạt động</p>
        <Button variant="link" onClick={() => navigate('/activities')}>Quay lại</Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Nộp minh chứng thành công!</h2>
        <p className="text-muted-foreground mb-6">Minh chứng của bạn đang chờ admin duyệt.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/activities')}>Tiếp tục tham gia</Button>
          <Button onClick={() => navigate('/my-submissions')}>Xem minh chứng</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/activities')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Nộp minh chứng</CardTitle>
              <CardDescription>Upload hình ảnh minh chứng cho hoạt động</CardDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">{activity.points} điểm</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hoạt động</Label>
            <p className="text-lg font-semibold mt-1">{activity.name}</p>
            {activity.description && (
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Chọn hình ảnh</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleFile} className="mt-1.5" />
          </div>

          {file && (
            <>
              <div>
                <Label>Tên file sau khi upload</Label>
                <p className="text-sm font-mono bg-muted px-3 py-2 rounded-md mt-1.5">{renamed}</p>
              </div>

              {preview && (
                <div>
                  <Label>Xem trước</Label>
                  <img src={preview} alt="Preview" className="mt-1.5 rounded-lg border max-h-64 object-contain w-full" />
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang upload...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Nộp minh chứng</>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
