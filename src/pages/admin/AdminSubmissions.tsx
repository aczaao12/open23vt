import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPendingSubmissions, getAllSubmissions, reviewSubmission, getSemesters } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { Submission, Semester } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, CheckCircle2, XCircle, ExternalLink, Eye, Calendar } from 'lucide-react'

const statusBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  pending: { variant: 'outline', label: 'Chờ duyệt' },
  approved: { variant: 'default', label: 'Đã duyệt' },
  rejected: { variant: 'destructive', label: 'Từ chối' },
}

export default function AdminSubmissions() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [filterSemester, setFilterSemester] = useState<string>('')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [reviewing, setReviewing] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) navigate('/activities', { replace: true })
  }, [isAdmin, authLoading, navigate])

  useEffect(() => { if (!authLoading) load() }, [filter, filterSemester, authLoading])

  async function load() {
    setLoading(true)
    const semId = filterSemester || undefined
    const [data, sems] = await Promise.all([
      filter === 'pending' ? getPendingSubmissions(semId) : getAllSubmissions(semId),
      getSemesters(),
    ])
    setSubmissions(data)
    setSemesters(sems)
    setLoading(false)
  }

  async function handleReview(id: string, status: 'approved' | 'rejected') {
    if (!user) return
    setReviewing(id)
    await reviewSubmission(id, status, user.id, notes[id] || '')
    setReviewing(null)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Duyệt minh chứng</h1>
          <p className="text-muted-foreground">Xem xét và phê duyệt minh chứng từ người dùng</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            options={[{ value: '', label: 'Tất cả HK' }, ...semesters.map((s) => ({ value: s.id, label: s.code }))]}
            className="w-32"
          />
          <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>
            Chờ duyệt
          </Button>
          <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
            Tất cả
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Không có minh chứng nào</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead>Học kỳ</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Tên file</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Duyệt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{sub.profile?.full_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{sub.profile?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{sub.activity?.name}</TableCell>
                    <TableCell>
                      {sub.semester ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {sub.semester.code}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">---</span>
                      )}
                    </TableCell>
                    <TableCell>{sub.activity?.points}</TableCell>
                    <TableCell className="max-w-[180px] truncate font-mono text-xs">
                      {sub.image_name}
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        ({sub.storage_type})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge[sub.status]?.variant}>
                        {statusBadge[sub.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sub.submitted_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="max-w-[150px]">
                      {sub.status === 'pending' ? (
                        <Textarea
                          placeholder="Ghi chú..."
                          className="min-h-[60px] text-xs"
                          value={notes[sub.id] || ''}
                          onChange={(e) => setNotes((n) => ({ ...n, [sub.id]: e.target.value }))}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">{sub.notes || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {sub.image_url && (
                          <a href={sub.image_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" title="Xem ảnh">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {sub.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => handleReview(sub.id, 'approved')}
                              disabled={reviewing === sub.id}
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => handleReview(sub.id, 'rejected')}
                              disabled={reviewing === sub.id}
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {submissions.map((sub) => (
              <Card key={sub.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{sub.activity?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{sub.profile?.full_name || 'N/A'}</p>
                    </div>
                    <Badge variant={statusBadge[sub.status]?.variant}>
                      {statusBadge[sub.status]?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {sub.semester && (
                    <Badge variant="outline" className="font-mono text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {sub.semester.code}
                    </Badge>
                  )}
                  <p><span className="text-muted-foreground">Điểm:</span> {sub.activity?.points}</p>
                  <p className="font-mono text-xs text-muted-foreground truncate">{sub.image_name}</p>
                  <p><span className="text-muted-foreground">Ngày:</span> {new Date(sub.submitted_at).toLocaleDateString('vi-VN')}</p>
                  {sub.image_url && (
                    <a href={sub.image_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary">
                      <ExternalLink className="h-3 w-3" /> Xem ảnh
                    </a>
                  )}
                  {sub.status === 'pending' ? (
                    <>
                      <Textarea
                        placeholder="Ghi chú..."
                        className="min-h-[60px] text-xs"
                        value={notes[sub.id] || ''}
                        onChange={(e) => setNotes((n) => ({ ...n, [sub.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleReview(sub.id, 'approved')}
                          disabled={reviewing === sub.id}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleReview(sub.id, 'rejected')}
                          disabled={reviewing === sub.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Từ chối
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p><span className="text-muted-foreground">Ghi chú:</span> {sub.notes || '-'}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
