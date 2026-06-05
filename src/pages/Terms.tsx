import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const sections = [
  {
    title: '1. Chấp nhận điều khoản',
    content: 'Bằng cách truy cập và sử dụng open23VT, bạn đồng ý tuân thủ các điều khoản dịch vụ này. Nếu bạn không đồng ý, vui lòng không sử dụng hệ thống.',
  },
  {
    title: '2. Mô tả dịch vụ',
    content: 'open23VT là hệ thống quản lý hoạt động và minh chứng dành cho sinh viên. Người dùng có thể đăng nhập bằng tài khoản Google, xem danh sách hoạt động, nộp minh chứng qua Google Drive, và theo dõi trạng thái phê duyệt.',
  },
  {
    title: '3. Trách nhiệm người dùng',
    content: 'Bạn chịu trách nhiệm về tính chính xác của thông tin và minh chứng mình nộp. Bạn không được sử dụng hệ thống cho mục đích bất hợp pháp hoặc gây hại đến hệ thống.',
  },
  {
    title: '4. Sử dụng Google Drive',
    content: 'Khi sử dụng tính năng đính kèm từ Google Drive, chúng tôi chỉ yêu cầu quyền truy cập vào các file bạn chọn. Bạn có thể thu hồi quyền này bất kỳ lúc nào trong phần quản lý tài khoản Google.',
  },
  {
    title: '5. Sở hữu trí tuệ',
    content: 'Nội dung minh chứng bạn nộp thuộc về bạn. Hệ thống chỉ lưu trữ và hiển thị phục vụ mục đích quản lý hoạt động.',
  },
  {
    title: '6. Giới hạn trách nhiệm',
    content: 'Chúng tôi không chịu trách nhiệm cho các thiệt hại phát sinh từ việc sử dụng hoặc không thể sử dụng hệ thống, bao gồm nhưng không giới hạn ở mất dữ liệu do sự cố kỹ thuật.',
  },
  {
    title: '7. Chấm dứt',
    content: 'Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu vi phạm điều khoản. Bạn có thể ngừng sử dụng hệ thống bất kỳ lúc nào.',
  },
  {
    title: '8. Thay đổi điều khoản',
    content: 'Chúng tôi có thể cập nhật điều khoản này. Việc tiếp tục sử dụng hệ thống sau khi thay đổi đồng nghĩa bạn chấp nhận điều khoản mới.',
  },
  {
    title: '9. Liên hệ',
    content: 'Mọi thắc mắc về điều khoản dịch vụ, vui lòng liên hệ: support@dh23vt.edu.vn.',
  },
]

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Điều khoản dịch vụ</h1>
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
