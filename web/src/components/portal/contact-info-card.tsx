import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactInfoCardProps {
  className?: string
}

export function ContactInfoCard({ className }: ContactInfoCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border shadow-sm p-6',
      className
    )}>
      <h3 className="text-xl font-bold text-foreground mb-6">
        Thông tin liên hệ
      </h3>

      <div className="space-y-4">
        {/* Address */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-base font-medium text-muted-foreground">Địa chỉ:</span>
            <p className="text-lg text-foreground mt-1 leading-relaxed">
              UBND Xã Diên Sanh<br />
              Huyện Hải Lăng, Tỉnh Quảng Trị
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg flex-shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-base font-medium text-muted-foreground">Điện thoại:</span>
            <p className="text-lg text-foreground mt-1">
              <a
                href="tel:0233123456"
                className="hover:text-primary-600 cursor-pointer"
              >
                0233.123.456
              </a>
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-base font-medium text-muted-foreground">Email:</span>
            <p className="text-lg text-foreground mt-1">
              <a
                href="mailto:ubnd@diensanh.quangtri.gov.vn"
                className="hover:text-primary-600 cursor-pointer"
              >
                ubnd@diensanh.quangtri.gov.vn
              </a>
            </p>
          </div>
        </div>

        {/* Working Hours */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-base font-medium text-muted-foreground">Giờ làm việc:</span>
            <div className="text-lg text-foreground mt-1 leading-relaxed">
              <p>Thứ 2 - Thứ 6: 7:30 - 11:30, 13:30 - 17:00</p>
              <p>Thứ 7: 7:30 - 11:30</p>
              <p>Chủ nhật: Nghỉ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}