import { useAuth } from '@/hooks/use-auth'

export function DashboardPage() {
  const { userDoc, logout } = useAuth()

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">UBND xã Diên Sanh</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {userDoc?.displayName}
            </span>
            <button
              onClick={logout}
              className="text-sm text-primary-600 hover:underline"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Tổng quan</h2>
          <p className="text-muted-foreground">
            Chào mừng bạn đến với hệ thống quản lý xã Diên Sanh.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vai trò: {userDoc?.role === 'commune_admin' ? 'Quản trị viên xã' :
                      userDoc?.role === 'village_leader' ? 'Trưởng thôn' : 'Cư dân'}
          </p>
        </div>
      </main>
    </div>
  )
}
