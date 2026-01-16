import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, Calendar, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { cn } from '@/lib/utils'
import type { Announcement } from '@/types'

export function AnnouncementsPage() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements', 'public'],
    queryFn: async () => {
      const now = new Date()
      const q = query(
        collection(db, 'announcements'),
        where('isPublic', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(20)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          publishedAt: doc.data().publishedAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        .filter((a) => !a.expiresAt || a.expiresAt > now) as Announcement[]
    },
  })

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/portal" className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Thông báo</h1>
            <p className="text-xs text-muted-foreground">UBND Xã Diên Sanh</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border divide-y">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-5 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
            ))
          ) : announcements?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có thông báo nào</p>
            </div>
          ) : (
            announcements?.map((announcement) => (
              <AnnouncementItem key={announcement.id} announcement={announcement} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function AnnouncementItem({ announcement }: { announcement: Announcement }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-medium">{announcement.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              {announcement.publishedAt?.toLocaleDateString('vi-VN')}
            </div>
          </div>
          <ChevronRight className={cn(
            'w-5 h-5 text-muted-foreground transition-transform',
            expanded && 'rotate-90'
          )} />
        </div>
      </button>
      {expanded && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {announcement.content}
          </p>
        </div>
      )}
    </div>
  )
}
