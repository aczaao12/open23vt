import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useActiveSemester } from '@/hooks/useSemester'
import { getSemesters, createSemester, updateSemester, deleteSemester, setActiveSemester } from '@/lib/api'
import type { Semester } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, Plus, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'

export default function AdminSemesters() {
  const { isAdmin, loading: authLoading } = useAuth()
  const { refresh: refreshActive } = useActiveSemester()
  const navigate = useNavigate()
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) navigate('/activities', { replace: true })
  }, [isAdmin, authLoading, navigate])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Semester | null>(null)
  const [code, setCode] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!authLoading) load() }, [authLoading])

  async function load() {
    setLoading(true)
    const data = await getSemesters()
    setSemesters(data)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setCode('')
    setDialogOpen(true)
  }

  function openEdit(sem: Semester) {
    setEditing(sem)
    setCode(sem.code)
    setDialogOpen(true)
  }

  async function handleSave() {
    const trimmed = code.toUpperCase().trim()
    if (!trimmed) return
    setSaving(true)
    if (editing) {
      await updateSemester(editing.id, trimmed)
    } else {
      await createSemester(trimmed)
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá học kỳ này?')) return
    await deleteSemester(id)
    await refreshActive()
    load()
  }

  async function handleSetActive(id: string) {
    await setActiveSemester(id)
    await refreshActive()
    load()
  }

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
          <h1 className="text-2xl font-bold">Quản lý học kỳ</h1>
          <p className="text-muted-foreground">Thêm, sửa, xoá học kỳ và chọn học kỳ hiện tại</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm học kỳ
        </Button>
      </div>

      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã học kỳ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[180px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters.map((sem) => (
              <TableRow key={sem.id}>
                <TableCell className="font-mono font-semibold text-base">{sem.code}</TableCell>
                <TableCell>
                  {sem.is_active ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Đang hoạt động
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Circle className="h-3 w-3 mr-1" /> Không hoạt động
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(sem.created_at).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!sem.is_active && (
                      <Button variant="outline" size="sm" onClick={() => handleSetActive(sem.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> Đặt active
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(sem)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(sem.id)}>
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
        {semesters.map((sem) => (
          <Card key={sem.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="font-mono text-base">{sem.code}</CardTitle>
                {sem.is_active ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {new Date(sem.created_at).toLocaleDateString('vi-VN')}
              </p>
              <div className="flex gap-2">
                {!sem.is_active && (
                  <Button variant="outline" size="sm" onClick={() => handleSetActive(sem.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> Đặt active
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => openEdit(sem)}>
                  <Pencil className="h-3 w-3 mr-1" /> Sửa
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(sem.id)}>
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
          <DialogTitle>{editing ? 'Sửa học kỳ' : 'Thêm học kỳ'}</DialogTitle>
          <DialogDescription>
            Mã học kỳ gồm 5 ký tự, VD: HK1N3, HK2N1
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="code">Mã học kỳ</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))}
              className="mt-1.5 font-mono"
              placeholder="VD: HK1N3"
              maxLength={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Huỷ</Button>
          <Button onClick={handleSave} disabled={saving || !code.trim()}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</> : (editing ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
