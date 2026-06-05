import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useActiveSemester } from '@/hooks/useSemester'
import { getSubmissions } from '@/lib/api'
import type { Submission } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, ExternalLink, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'

const statusBadge: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
  pending: { variant: 'outline', icon: <Clock className="h-3 w-3 mr-1" />, label: 'Chờ duyệt' },
  approved: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3 mr-1" />, label: 'Đã duyệt' },
  rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" />, label: 'Từ chối' },
}

export default function MySubmissions() {
  const { user } = useAuth()
  const { activeSemester, loading: semLoading } = useActiveSemester()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || semLoading) return
    getSubmissions(user.id, activeSemester?.id).then(setSubmissions).finally(() => setLoading(false))
  }, [user, activeSemester, semLoading])

  if (loading || semLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalPoints = submissions
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + (s.activity?.points || 0), 0)

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Minh chứng của tôi</h1>
          {activeSemester && (
            <Badge variant="secondary" className="font-mono">
              <Calendar className="h-3 w-3 mr-1" />
              {activeSemester.code}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Tổng điểm: <strong>{totalPoints}</strong> | Đã nộp: <strong>{submissions.length}</strong>
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Bạn chưa nộp minh chứng nào</p>
        </div>
      ) : (
        <div className="hidden md:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hoạt động</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Tên file</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày nộp</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => {
                const sb = statusBadge[sub.status]
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.activity?.name}</TableCell>
                    <TableCell>{sub.activity?.points}</TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-xs">{sub.image_name}</TableCell>
                    <TableCell>
                      <Badge variant={sb.variant}>
                        {sb.icon}
                        {sb.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sub.submitted_at).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{sub.notes || '-'}</TableCell>
                    <TableCell>
                      {sub.image_url && (
                        <a href={sub.image_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {submissions.map((sub) => {
          const sb = statusBadge[sub.status]
          return (
            <Card key={sub.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{sub.activity?.name}</CardTitle>
                  <Badge variant={sb.variant}>{sb.icon}{sb.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Điểm:</span> {sub.activity?.points}</p>
                <p className="font-mono text-xs text-muted-foreground truncate">{sub.image_name}</p>
                <p><span className="text-muted-foreground">Ngày nộp:</span> {new Date(sub.submitted_at).toLocaleDateString('vi-VN')}</p>
                {sub.notes && <p><span className="text-muted-foreground">Ghi chú:</span> {sub.notes}</p>}
                {sub.image_url && (
                  <a href={sub.image_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-sm">
                    <ExternalLink className="h-3 w-3" /> Xem ảnh
                  </a>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
