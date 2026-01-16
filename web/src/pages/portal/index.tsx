import { Bell, FileText, Search, MessageSquare } from 'lucide-react'
import { PortalLayout } from '@/components/layout/portal-layout'
import { HeroSection } from '@/components/portal/hero-section'
import { QuickAccessCard } from '@/components/portal/quick-access-card'
import { ContactInfoCard } from '@/components/portal/contact-info-card'
import { HotlineButton } from '@/components/portal/hotline-button'

export function PortalHomePage() {
  return (
    <PortalLayout showSearch={false} showLogin={true}>
      {/* Hero with search */}
      <HeroSection />

      {/* Primary actions - 2x2 grid on mobile, 4-column on desktop */}
      <section className="px-4 -mt-8 relative z-10 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAccessCard
            icon={<Bell className="w-12 h-12" />}
            title="Thông báo"
            description="Xem các thông báo mới nhất từ UBND xã"
            href="/portal/announcements"
            color="blue"
          />
          <QuickAccessCard
            icon={<FileText className="w-12 h-12" />}
            title="Gửi yêu cầu"
            description="Gửi đơn, kiến nghị, phản ánh đến UBND"
            href="/portal/request-form"
            color="green"
          />
          <QuickAccessCard
            icon={<Search className="w-12 h-12" />}
            title="Tra cứu"
            description="Tra cứu tình trạng yêu cầu đã gửi"
            href="/portal/requests"
            color="purple"
          />
          <QuickAccessCard
            icon={<MessageSquare className="w-12 h-12" />}
            title="Hỏi đáp"
            description="Chatbot hỗ trợ 24/7 giải đáp thắc mắc"
            href="/portal/chatbot"
            color="orange"
          />
        </div>
      </section>

      {/* Contact Info */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <ContactInfoCard />
        </div>
      </section>

      {/* Mobile hotline button */}
      <HotlineButton className="lg:hidden" />
    </PortalLayout>
  )
}
