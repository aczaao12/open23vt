import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useActiveSemester } from '@/hooks/useSemester'
import { getActivities, createActivity, updateActivity, deleteActivity, getSemesters } from '@/lib/api'
import type { Activity, Semester } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus, Pencil, Trash2, Trophy, Calendar } from 'lucide-react'

export default function AdminActivities() {
  const { isAdmin, loading: authLoading } = useAuth()
  const { activeSemester } = useActiveSemester()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) navigate('/activities', { replace: true })
  }, [isAdmin, authLoading, navigate])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [filterSemester, setFilterSemester] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!authLoading) load() }, [authLoading])

  async function load() {
    setLoading(true)
    const [acts, sems] = await Promise.all([
      getActivities(filterSemester || undefined),
      getSemesters(),
    ])
    setActivities(acts)
    setSemesters(sems)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setName('')
    setDescription('')
    setPoints('')
    setSemesterId(activeSemester?.id || '')
    setDialogOpen(true)
  }

  function openEdit(act: Activity) {
    setEditing(act)
    setName(act.name)
    setDescription(act.description || '')
    setPoints(String(act.points))
    setSemesterId(act.semester_id || '')
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name || !points) return
    setSaving(true)
    if (editing) {
      await updateActivity(editing.id, { name, description, points: Number(points), semester_id: semesterId || null })
    } else {
      await createActivity({ name, description, points: Number(points), semester_id: semesterId || null })
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá hoạt động này?')) return
    await deleteActivity(id)
    load()
  }

  const semOptions = semesters.map((s) => ({ value: s.id, label: s.code }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý hoạt động</h1>
          <p className="text-muted-foreground">Thêm, sửa, xoá các hoạt động</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm hoạt động
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-2">
        <Label className="text-sm shrink-0">Lọc theo học kỳ:</Label>
        <Select
          value={filterSemester}
          onChange={(e) => { setFilterSemester(e.target.value) }}
          options={[{ value: '', label: 'Tất cả' }, ...semOptions]}
          className="w-40"
        />
      </div>

      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên hoạt động</TableHead>
              <TableHead>Học kỳ</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Điểm</TableHead>
              <TableHead className="w-[120px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act) => (
              <TableRow key={act.id}>
                <TableCell className="font-medium">{act.name}</TableCell>
                <TableCell>
                  {act.semester ? (
                    <Badge variant="outline" className="font-mono">
                      <Calendar className="h-3 w-3 mr-1" />
                      {act.semester.code}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">---</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[250px] truncate">
                  {act.description || '-'}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="h-3 w-3" /> {act.points}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(act)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(act.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {activities.map((act) => (
          <Card key={act.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{act.name}</CardTitle>
                <span className="inline-flex items-center gap-1 text-sm font-medium">
                  <Trophy className="h-3 w-3" /> {act.points}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {act.semester && (
                <Badge variant="outline" className="font-mono">
                  <Calendar className="h-3 w-3 mr-1" />
                  {act.semester.code}
                </Badge>
              )}
              <p className="text-sm text-muted-foreground">{act.description || '-'}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(act)}>
                  <Pencil className="h-3 w-3 mr-1" /> Sửa
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(act.id)}>
                  <Trash2 className="h-3 w-3 mr-1 text-destructive" /> Xoá
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>{editing ? 'Sửa hoạt động' : 'Thêm hoạt động'}</DialogTitle>
          <DialogDescription>Nhập thông tin hoạt động bên dưới.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="semester">Học kỳ</Label>
            <Select
              id="semester"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              options={[{ value: '', label: '--- Chọn học kỳ ---' }, ...semOptions]}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="name">Tên hoạt động</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="VD: Chạy bộ" />
          </div>
          <div>
            <Label htmlFor="desc">Mô tả</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" placeholder="Mô tả hoạt động..." />
          </div>
          <div>
            <Label htmlFor="points">Điểm số</Label>
            <Input id="points" type="number" value={points} onChange={(e) => setPoints(e.target.value)} className="mt-1.5" placeholder="10" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Huỷ</Button>
          <Button onClick={handleSave} disabled={saving || !name || !points}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</> : (editing ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
