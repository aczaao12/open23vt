import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivities } from '@/lib/api'
import { useActiveSemester } from '@/hooks/useSemester'
import type { Activity } from '@/types/database'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, ArrowRight, Calendar } from 'lucide-react'

export default function Activities() {
  const { activeSemester, loading: semLoading } = useActiveSemester()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (semLoading) return
    getActivities(activeSemester?.id)
      .then(setActivities)
      .finally(() => setLoading(false))
  }, [activeSemester, semLoading])

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Card key={activity.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{activity.name}</CardTitle>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    <Trophy className="h-3 w-3 mr-1" />
                    {activity.points} điểm
                  </Badge>
                </div>
                {activity.description && (
                  <CardDescription>{activity.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                <Button className="w-full" onClick={() => navigate(`/activities/${activity.id}/submit`)}>
                  Tham gia
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
