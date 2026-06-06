import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getActivity, getSubmission, createSubmission, updateSubmission, deleteSubmission } from '@/lib/api'
import { uploadFile, deleteFile } from '@/lib/storage'
import { normalizeFileName, getImageExt } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useActiveSemester } from '@/hooks/useSemester'
import type { Activity, Submission } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import MarkdownViewer from '@/components/ui/markdown-viewer'
import { Loader2, Upload, CheckCircle2, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react'

type PageMode = 'loading' | 'not-found' | 'new' | 'edit' | 'approved' | 'rejected' | 'done'

export default function Submit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeSemester } = useActiveSemester()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [mode, setMode] = useState<PageMode>('loading')

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [renamed, setRenamed] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  useEffect(() => {
    if (!id || !user) return
    Promise.all([
      getActivity(id),
      getSubmission(id, user.id),
    ]).then(([act, sub]) => {
      setActivity(act)
      setSubmission(sub)

      if (!act) { setMode('not-found'); return }
      if (!sub) { setMode('new'); return }

      if (sub.status === 'approved') setMode('approved')
      else if (sub.status === 'rejected') setMode('rejected')
      else setMode('edit')
    })
  }, [id, user])

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

  async function handleSave() {
    if (!file || !user || !activity || !submission) return
    setSubmitting(true)
    setError('')

    try {
      await deleteFile(submission)

      const result = await uploadFile(file, renamed, user.id)
      await updateSubmission(submission.id, {
        image_drive_id: result.driveId || '',
        image_name: result.fileName,
        image_url: result.driveUrl || result.supabaseUrl || null,
        storage_type: result.storageType,
        supabase_path: result.supabasePath || null,
      })
      setMode('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResubmit() {
    if (!file || !user || !activity) return
    setSubmitting(true)
    setError('')

    try {
      if (submission) await deleteFile(submission)

      const result = await uploadFile(file, renamed, user.id)
      if (submission) {
        await updateSubmission(submission.id, {
          image_drive_id: result.driveId || '',
          image_name: result.fileName,
          image_url: result.driveUrl || result.supabaseUrl || null,
          storage_type: result.storageType,
          supabase_path: result.supabasePath || null,
        })
      } else {
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
      }
      setMode('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nộp lại thất bại')
    } finally {
      setSubmitting(false)
    }
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
      setMode('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRevoke() {
    if (!submission) return
    setSubmitting(true)
    try {
      await deleteFile(submission)
      await deleteSubmission(submission.id)
      navigate('/my-submissions', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Thu hồi thất bại')
      setSubmitting(false)
    }
  }

  if (mode === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (mode === 'not-found' || !activity) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Không tìm thấy hoạt động</p>
        <Button variant="link" onClick={() => navigate('/activities')}>Quay lại</Button>
      </div>
    )
  }

  if (mode === 'done') {
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

  if (mode === 'approved') {
    return (
      <div className="max-w-xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/activities')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Minh chứng đã duyệt</CardTitle>
                <CardDescription>Bạn không thể thay đổi minh chứng đã được duyệt</CardDescription>
              </div>
              <Badge variant="default" className="shrink-0">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Đã duyệt
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Hoạt động</Label>
              <p className="text-lg font-semibold mt-1">{activity.name}</p>
            </div>
            {submission?.image_url && (
              <div>
                <Label>Minh chứng</Label>
                <a href={submission.image_url} target="_blank" rel="noopener noreferrer">
                  <img src={submission.image_url} alt="Minh chứng" className="mt-1.5 rounded-lg border max-h-64 object-contain w-full" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const isEdit = mode === 'edit'
  const isRejected = mode === 'rejected'
  const title = isEdit ? 'Sửa minh chứng' : isRejected ? 'Nộp lại minh chứng' : 'Nộp minh chứng'
  const desc = isEdit
    ? 'Chọn file mới để thay thế minh chứng hiện tại'
    : isRejected
    ? 'Minh chứng trước đã bị từ chối, vui lòng nộp lại'
    : 'Upload hình ảnh minh chứng cho hoạt động'
  const btnLabel = isEdit ? 'Cập nhật' : isRejected ? 'Nộp lại' : 'Nộp minh chứng'
  const handlePrimary = isEdit ? handleSave : isRejected ? handleResubmit : handleSubmit

  return (
    <div className="max-w-xl mx-auto">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/activities')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">{activity.points} điểm</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hoạt động</Label>
            <p className="text-lg font-semibold mt-1">{activity.name}</p>
            {activity.description && <MarkdownViewer content={activity.description} />}
          </div>

          {/* Show current file in edit/resubmit mode */}
          {(isEdit || isRejected) && submission?.image_url && (
            <div>
              <Label>{isRejected ? 'Minh chứng cũ' : 'Minh chứng hiện tại'}</Label>
              <a href={submission.image_url} target="_blank" rel="noopener noreferrer">
                <img src={submission.image_url} alt="Minh chứng" className="mt-1.5 rounded-lg border max-h-48 object-contain w-full" />
              </a>
            </div>
          )}

          <div>
            <Label htmlFor="image">{isEdit ? 'Chọn file mới' : 'Chọn hình ảnh'}</Label>
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

              <Button className="w-full" onClick={handlePrimary} disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang xử lý...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />{btnLabel}</>
                )}
              </Button>
            </>
          )}

          {/* Revoke — only for pending */}
          {isEdit && !confirmRevoke && (
            <Button variant="outline" className="w-full text-destructive" onClick={() => setConfirmRevoke(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Thu hồi minh chứng
            </Button>
          )}
          {isEdit && confirmRevoke && (
            <div className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>Xác nhận thu hồi? Hành động này không thể hoàn tác.</span>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" className="flex-1" onClick={handleRevoke} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                  Xác nhận thu hồi
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmRevoke(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {error && !file && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
