import { cn } from "@/lib/utils"

interface GovernmentFooterProps {
  className?: string
}

export function GovernmentFooter({ className }: GovernmentFooterProps) {
  return (
    <footer className={cn(
      "bg-primary-900 text-primary-100 border-t-4 border-gov-red mt-auto",
      className
    )}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="font-bold text-white mb-4">Thông tin liên hệ</h3>
            <div className="space-y-2 text-sm text-primary-200">
              <p>
                <strong>Địa chỉ:</strong><br />
                UBND Xã Diên Sanh<br />
                Tỉnh Quảng Trị
              </p>
              <p>
                <strong>Điện thoại:</strong> (0233) 123.456
              </p>
              <p>
                <strong>Email:</strong> ubnd@diensanh.quangtri.gov.vn
              </p>
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="font-bold text-white mb-4">Giờ làm việc</h3>
            <div className="space-y-2 text-sm text-primary-200">
              <p>
                <strong>Thứ 2 - Thứ 6:</strong><br />
                7:30 - 11:30 | 13:30 - 17:00
              </p>
              <p>
                <strong>Thứ 7:</strong><br />
                7:30 - 11:30
              </p>
              <p>
                <strong>Chủ nhật:</strong> Nghỉ
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Liên kết nhanh</h3>
            <div className="space-y-2">
              <a
                href="/privacy"
                className="block text-sm text-primary-200 hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: 'var(--spacing-touch)' }}
              >
                Chính sách bảo mật
              </a>
              <a
                href="/accessibility"
                className="block text-sm text-primary-200 hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: 'var(--spacing-touch)' }}
              >
                Tuyên bố trợ năng
              </a>
              <a
                href="/sitemap"
                className="block text-sm text-primary-200 hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: 'var(--spacing-touch)' }}
              >
                Sơ đồ trang web
              </a>
              <a
                href="/feedback"
                className="block text-sm text-primary-200 hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: 'var(--spacing-touch)' }}
              >
                Góp ý - Phản hồi
              </a>
            </div>
          </div>

          {/* Government Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Liên kết chính phủ</h3>
            <div className="space-y-2">
              <a
                href="https://chinhphu.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary-200 hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: 'var(--spacing-touch)' }}
              >
                Cổng thông tin Chính phủ
              </a>
              <a
                href="https://quangtri.gov.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-primary-200 hover:text-white transition-colors cursor-pointer"
                style={{ minHeight: 'var(--spacing-touch)' }}
              >
                UBND Tỉnh Quảng Trị
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar with copyright */}
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>
              © 2026 UBND Xã Diên Sanh. Bảo lưu mọi quyền.
            </p>
            <p className="mt-2 md:mt-0">
              Phiên bản: 2.0 | Cập nhật: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* Government accent border */}
      <div className="h-1 bg-gradient-to-r from-gov-red via-gov-gold to-gov-red"></div>
    </footer>
  )
}