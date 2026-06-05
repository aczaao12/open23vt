import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { SemesterProvider } from '@/hooks/useSemester'
import { AuthGuard } from '@/components/AuthGuard'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import Login from '@/pages/Login'
import Activities from '@/pages/Activities'
import Submit from '@/pages/Submit'
import MySubmissions from '@/pages/MySubmissions'
import AdminActivities from '@/pages/admin/AdminActivities'
import AdminSubmissions from '@/pages/admin/AdminSubmissions'
import AdminSemesters from '@/pages/admin/AdminSemesters'
import AdminStorage from '@/pages/admin/AdminStorage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SemesterProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route element={<AuthGuard><Layout /></AuthGuard>}>
                <Route path="/activities" element={<Activities />} />
                <Route path="/activities/:id/submit" element={<Submit />} />
                <Route path="/my-submissions" element={<MySubmissions />} />
                <Route path="/admin/activities" element={<AdminActivities />} />
                <Route path="/admin/submissions" element={<AdminSubmissions />} />
                <Route path="/admin/semesters" element={<AdminSemesters />} />
                <Route path="/admin/storage" element={<AdminStorage />} />
              </Route>
              <Route path="*" element={<Navigate to="/activities" replace />} />
            </Routes>
          </SemesterProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
