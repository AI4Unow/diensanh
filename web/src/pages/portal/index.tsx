import { Link } from 'react-router-dom'
import { MessageSquare, FileText, Bell, HelpCircle } from 'lucide-react'

export function PortalHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-primary-700">UBND Xã Diên Sanh</h1>
            <p className="text-xs text-muted-foreground">Cổng thông tin điện tử</p>
          </div>
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-primary-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Xin chào!</h2>
          <p className="text-primary-100">
            Chào mừng bạn đến với cổng thông tin điện tử xã Diên Sanh
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/portal/announcements"
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">Thông báo</h3>
            <p className="text-sm text-muted-foreground">Xem các thông báo mới nhất</p>
          </Link>

          <Link
            to="/portal/requests/new"
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="p-3 bg-green-50 text-green-600 rounded-lg w-fit mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">Gửi yêu cầu</h3>
            <p className="text-sm text-muted-foreground">Gửi đơn, kiến nghị, phản ánh</p>
          </Link>

          <Link
            to="/portal/requests"
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg w-fit mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">Tra cứu</h3>
            <p className="text-sm text-muted-foreground">Tra cứu tình trạng yêu cầu</p>
          </Link>

          <Link
            to="/portal/chatbot"
            className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg w-fit mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-1">Hỏi đáp</h3>
            <p className="text-sm text-muted-foreground">Chatbot hỗ trợ 24/7</p>
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-4">Thông tin liên hệ</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Địa chỉ:</span>
              <p>Xã Diên Sanh, Huyện Hải Lăng, Tỉnh Quảng Trị</p>
            </div>
            <div>
              <span className="text-muted-foreground">Điện thoại:</span>
              <p>0233.xxx.xxx</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p>ubnd.diensanh@quangtri.gov.vn</p>
            </div>
            <div>
              <span className="text-muted-foreground">Giờ làm việc:</span>
              <p>Thứ 2 - Thứ 6: 7:30 - 11:30, 13:30 - 17:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-6 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 UBND Xã Diên Sanh. Bản quyền thuộc về UBND xã Diên Sanh.</p>
        </div>
      </footer>
    </div>
  )
}
