import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivities, getSubmissions } from '@/lib/api'
import { useActiveSemester } from '@/hooks/useSemester'
import { useAuth } from '@/hooks/useAuth'
import type { Activity, SubmissionStatus } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MarkdownViewer from '@/components/ui/markdown-viewer'
import { Loader2, Trophy, Calendar, ChevronDown, ChevronUp, ArrowRight, Clock, Check, X } from 'lucide-react'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Activities() {
  const { activeSemester, loading: semLoading } = useActiveSemester()
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [statusMap, setStatusMap] = useState<Record<string, SubmissionStatus>>({})
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (semLoading) return
    const load = async () => {
      const [acts, subs] = await Promise.all([
        getActivities(activeSemester?.id),
        user ? getSubmissions(user.id, activeSemester?.id) : Promise.resolve([]),
      ])
      setActivities(acts)
      const map: Record<string, SubmissionStatus> = {}
      for (const sub of subs) {
        map[sub.activity_id] = sub.status
      }
      setStatusMap(map)
      setLoading(false)
    }
    load()
  }, [activeSemester, semLoading, user])

  if (loading || semLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Hoạt động</h1>
          {activeSemester && (
            <Badge variant="secondary" className="font-mono">
              <Calendar className="h-3 w-3 mr-1" />
              {activeSemester.code}
            </Badge>
          )}
        </div>
        {activeSemester ? (
          <p className="text-muted-foreground">Chọn hoạt động bạn đã tham gia và nộp minh chứng</p>
        ) : (
          <p className="text-muted-foreground text-amber-600">Chưa có học kỳ nào được kích hoạt. Vui lòng liên hệ admin.</p>
        )}
      </div>

      {!activeSemester ? null : activities.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Chưa có hoạt động nào cho học kỳ này</p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Timeline vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

          <div className="space-y-0">
            {activities.map((activity) => {
              const isOpen = expandedId === activity.id

              const status = statusMap[activity.id]

              let dotStyle = 'border-muted-foreground/30 bg-background hover:border-primary/50'
              let inner = <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              if (status === 'pending') {
                dotStyle = 'border-amber-400 bg-amber-50 hover:border-amber-500'
                inner = <Check className="h-3 w-3 text-amber-500" />
              } else if (status === 'approved') {
                dotStyle = 'border-green-500 bg-green-500 hover:bg-green-600'
                inner = <Check className="h-3 w-3 text-white" />
              } else if (status === 'rejected') {
                dotStyle = 'border-red-500 bg-red-500 hover:bg-red-600'
                inner = <X className="h-3 w-3 text-white" />
              }

              return (
                <div key={activity.id} className="relative pb-0">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-7 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors z-10 ${dotStyle}`}
                    onClick={() => setExpandedId(isOpen ? null : activity.id)}
                  >
                    {inner}
                  </div>

                  {/* Card */}
                  <div className="border rounded-lg mb-3 transition-shadow hover:shadow-sm">
                    {/* Summary row — always visible */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer select-none"
                      onClick={() => setExpandedId(isOpen ? null : activity.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{activity.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(activity.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="shrink-0">
                          <Trophy className="h-3 w-3 mr-1" />
                          {activity.points} điểm
                        </Badge>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="border-t px-4 py-3 space-y-3">
                        {activity.description && (
                          <MarkdownViewer content={activity.description} />
                        )}
                        <Button
                          className="w-full"
                          onClick={() => navigate(`/activities/${activity.id}/submit`)}
                        >
                          Tham gia
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
