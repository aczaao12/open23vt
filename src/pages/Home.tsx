import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogIn, FileCheck, ClipboardList, ShieldCheck, ArrowRight, GraduationCap, CheckCircle2 } from 'lucide-react'

const features = [
  {
    icon: ClipboardList,
    title: 'Quản lý hoạt động',
    desc: 'Theo dõi danh sách hoạt động của khoa, trường một cách trực quan.',
  },
  {
    icon: FileCheck,
    title: 'Nộp minh chứng',
    desc: 'Đính kèm file minh chứng qua Google Drive an toàn, nhanh chóng.',
  },
  {
    icon: ShieldCheck,
    title: 'Duyệt minh chứng',
    desc: 'Admin phê duyệt minh chứng trực tuyến, theo dõi trạng thái real-time.',
  },
]

const steps = [
  { step: '01', title: 'Đăng nhập', desc: 'Sử dụng tài khoản Google để đăng nhập.' },
  { step: '02', title: 'Chọn hoạt động', desc: 'Xem danh sách hoạt động và chọn hoạt động cần nộp.' },
  { step: '03', title: 'Nộp minh chứng', desc: 'Tải lên file minh chứng từ Drive và gửi.' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">open23VT</span>
          </div>
          <Button onClick={() => navigate('/login')}>
            <LogIn className="h-4 w-4 mr-2" />
            Đăng nhập
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border bg-white px-4 py-1.5 text-sm text-gray-600 shadow-sm">
                <CheckCircle2 className="mr-1.5 h-4 w-4 text-green-500" />
                Hệ thống quản lý hoạt động
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                open23VT
              </h1>
              <p className="mt-4 text-lg text-gray-600 sm:text-xl">
                Nền tảng quản lý hoạt động và minh chứng dành cho sinh viên.
                Đăng nhập bằng tài khoản Google để bắt đầu.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/login')}>
                  <LogIn className="h-5 w-5 mr-2" />
                  Đăng nhập với Google
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full from-blue-100/50" />
        </section>

        {/* Features */}
        <section className="border-t bg-white py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Tính năng chính</h2>
              <p className="mt-2 text-gray-600">Mọi thứ bạn cần để quản lý hoạt động và minh chứng.</p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {features.map((f) => (
                <Card key={f.title} className="group border-0 bg-gray-50 shadow-sm transition-all hover:bg-indigo-50 hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-colors group-hover:ring-indigo-200">
                      <f.icon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Cách hoạt động</h2>
              <p className="mt-2 text-gray-600">Chỉ 3 bước đơn giản để bắt đầu.</p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.step} className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="absolute top-8 left-[60%] hidden h-0.5 w-[60%] bg-indigo-200 sm:block" />
                  )}
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-lg">
                    {s.step}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sẵn sàng để bắt đầu?</h2>
            <p className="mt-2 text-gray-600">Đăng nhập ngay để quản lý hoạt động và nộp minh chứng.</p>
            <Button size="lg" className="mt-8" onClick={() => navigate('/login')}>
              <LogIn className="h-5 w-5 mr-2" />
              Đăng nhập với Google
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <span className="font-medium text-gray-700">open23VT</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-gray-500 transition-colors hover:text-gray-700">Chính sách bảo mật</a>
              <a href="/terms" className="text-gray-500 transition-colors hover:text-gray-700">Điều khoản dịch vụ</a>
            </div>
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} open23VT</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
