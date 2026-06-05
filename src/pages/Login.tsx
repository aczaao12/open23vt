import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn } from 'lucide-react'

export default function Login() {
  const { user, loading, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/activities', { replace: true })
  }, [user, loading, navigate])

  if (loading) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">open23VT</CardTitle>
          <CardDescription>Đăng nhập để quản lý hoạt động và minh chứng</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" size="lg" onClick={signInWithGoogle}>
            <LogIn className="h-5 w-5 mr-2" />
            Đăng nhập với Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
