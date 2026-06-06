import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { upsertProfile } from '@/lib/api'
import { uploadFile } from '@/lib/storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Camera, Save } from 'lucide-react'

const genderOptions = [
  { value: 'Nam', label: 'Nam' },
  { value: 'Nữ', label: 'Nữ' },
  { value: 'Khác', label: 'Khác' },
]

export default function Profile() {
  const { user, profile, loading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [birthday, setBirthday] = useState(profile?.birthday || '')
  const [gender, setGender] = useState(profile?.gender || '')
  const [hometown, setHometown] = useState(profile?.hometown || '')
  const [position, setPosition] = useState(profile?.position || '')

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarFile(f)
    setError('')
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(f)
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      let avatarUrl = profile?.avatar_url

      if (avatarFile) {
        const result = await uploadFile(avatarFile, `avatar_${Date.now()}`, user.id)
        avatarUrl = result.driveUrl || result.supabaseUrl || null
      }

      await upsertProfile({
        id: user.id,
        avatar_url: avatarUrl,
        birthday: birthday || null,
        gender: gender || null,
        hometown: hometown || null,
        position: position || null,
      })

      setSaved(true)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trang cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin hồ sơ của bạn</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
          <CardDescription>Nhấp vào ảnh để thay đổi</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
          >
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarSelect}
          />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{profile?.full_name}</p>
            <p>{profile?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthday">Ngày sinh</Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                id="gender"
                options={genderOptions}
                placeholder="Chọn giới tính"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hometown">Quê quán</Label>
              <Input
                id="hometown"
                placeholder="Tỉnh/Thành phố"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Chức vụ</Label>
              <Input
                id="position"
                placeholder="Chức vụ hiện tại"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-green-600">Đã lưu thông tin!</p>}

          <Button className="w-full sm:w-auto" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Lưu thay đổi</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Placeholder for future features */}
      <Card>
        <CardHeader>
          <CardTitle>Tính năng khác</CardTitle>
          <CardDescription>Các tính năng đang phát triển</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            Thông tin liên hệ, đổi mật khẩu, và các tính năng khác sẽ sớm được cập nhật.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
