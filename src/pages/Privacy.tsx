import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const sections = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    content: 'Khi bạn đăng nhập bằng tài khoản Google, chúng tôi thu thập các thông tin sau: email, tên hiển thị, ảnh đại diện. Khi bạn sử dụng tính năng đính kèm file từ Google Drive, chúng tôi chỉ truy cập các file bạn chọn để tải lên làm minh chứng. Chúng tôi không tự động truy cập toàn bộ ổ Drive của bạn.',
  },
  {
    title: '2. Mục đích sử dụng thông tin',
    content: 'Thông tin của bạn được sử dụng để: xác thực tài khoản, hiển thị thông tin cá nhân trên hệ thống, lưu trữ minh chứng bạn nộp, và liên hệ khi cần xác minh. Dữ liệu Drive chỉ được dùng để tải file minh chứng bạn chủ động chọn.',
  },
  {
    title: '3. Chia sẻ thông tin',
    content: 'Chúng tôi không bán, cho thuê, hay chia sẻ thông tin cá nhân của bạn cho bên thứ ba, trừ khi có yêu cầu từ pháp luật hoặc được sự đồng ý của bạn.',
  },
  {
    title: '4. Lưu trữ và bảo mật',
    content: 'Dữ liệu được lưu trữ trên cơ sở dữ liệu của Supabase và Google Drive theo tiêu chuẩn bảo mật. Chúng tôi áp dụng các biện pháp kỹ thuật để bảo vệ dữ liệu khỏi truy cập trái phép.',
  },
  {
    title: '5. Quyền của người dùng',
    content: 'Bạn có quyền yêu cầu xem, sửa hoặc xóa dữ liệu cá nhân của mình bất kỳ lúc nào. Liên hệ với chúng tôi qua email bên dưới để thực hiện các quyền này.',
  },
  {
    title: '6. Thay đổi chính sách',
    content: 'Chúng tôi có thể cập nhật chính sách này. Mọi thay đổi sẽ được đăng tải tại trang này và có hiệu lực ngay khi được đăng.',
  },
  {
    title: '7. Liên hệ',
    content: 'Nếu bạn có thắc mắc về chính sách bảo mật, vui lòng liên hệ qua email: support@dh23vt.edu.vn.',
  },
]

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Chính sách bảo mật</h1>
        <p className="mt-2 text-sm text-gray-500">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

        <div className="mt-8 space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-gray-800">{s.title}</h2>
              <p className="mt-1 text-gray-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
