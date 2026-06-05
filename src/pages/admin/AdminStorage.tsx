import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { getStorageConfig, updateStorageConfig } from '@/lib/api'
import type { StorageConfig, StorageType } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Save, HardDrive, Cloud } from 'lucide-react'

const options: { value: StorageType; icon: typeof HardDrive; label: string; desc: string }[] = [
  { value: 'drive', icon: HardDrive, label: 'Google Drive', desc: 'Lưu vào Google Drive của người dùng' },
  { value: 'supabase', icon: Cloud, label: 'Supabase Storage', desc: 'Lưu vào Supabase Storage' },
]

export default function AdminStorage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [config, setConfig] = useState<StorageConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [backend, setBackend] = useState<StorageType>('drive')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) navigate('/activities', { replace: true })
  }, [isAdmin, authLoading, navigate])

  useEffect(() => {
    if (!authLoading) load()
  }, [authLoading])

  async function load() {
    setLoading(true)
    const data = await getStorageConfig()
    setConfig(data)
    if (data) setBackend(data.storage_backend)
    setLoading(false)
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setMessage('')
    try {
      await updateStorageConfig({ storage_backend: backend }, user.id)
      setMessage('Đã lưu cấu hình thành công')
      load()
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Lỗi khi lưu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Cấu hình lưu trữ</h1>
        <p className="text-muted-foreground">Chọn nơi lưu trữ minh chứng khi người dùng upload</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nơi lưu trữ</CardTitle>
          <CardDescription>Chọn một nơi lưu trữ file minh chứng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <fieldset className="space-y-3">
            {options.map((opt) => {
              const Icon = opt.icon
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                    backend === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                  }`}
                >
                  <input
                    type="radio"
                    name="storage_backend"
                    value={opt.value}
                    checked={backend === opt.value}
                    onChange={() => setBackend(opt.value)}
                    className="h-4 w-4 text-primary"
                  />
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <Label className="text-base font-medium cursor-pointer">{opt.label}</Label>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </div>
                </label>
              )
            })}
          </fieldset>

          {message && (
            <p className={`text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-destructive'}`}>
              {message}
            </p>
          )}

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Lưu cấu hình</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
