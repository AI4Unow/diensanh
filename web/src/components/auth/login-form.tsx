import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'
import { NationalEmblem } from '@/components/ui/national-emblem'
import { useLoginMutation } from '../../hooks/use-auth-mutations'
import { Eye, EyeOff } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
}

const getErrorMessage = (error: string) => {
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Số điện thoại hoặc mật khẩu không đúng.',
    'auth/user-not-found': 'Tài khoản không tồn tại.',
    'auth/wrong-password': 'Mật khẩu không đúng.',
    'auth/too-many-requests': 'Đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau.',
    'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa.',
  }
  // Check if it's likely a firebase error code, otherwise return default
  if (error.startsWith('auth/')) {
    return messages[error] || 'Lỗi đăng nhập. Vui lòng thử lại.'
  }
  return error; // Return raw error if not a standard code (or handled by mutation)
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const loginMutation = useLoginMutation()

  const loading = loginMutation.isPending
  const rawError = loginMutation.error?.message
  const error = rawError ? getErrorMessage(rawError) : null

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()

    // Clear legacy test mode flags to ensure we use real Firebase Auth
    localStorage.removeItem('diensanh:testMode')
    localStorage.removeItem('diensanh:userDoc')
    localStorage.removeItem('firebase:authUser:[DEFAULT]')

    try {
      await loginMutation.mutateAsync({ phone, pass: password })
      onSuccess?.()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-xl shadow-lg p-8 md:p-10">
        {/* National Emblem */}
        <div className="text-center mb-6">
          <NationalEmblem size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">
            UBND xã Diên Sanh
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Hệ thống quản lý xã
          </p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive font-medium px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-lg font-medium mb-3 text-foreground">
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0912345678"
              className={cn(
                "w-full px-5 py-4 rounded-lg border bg-background text-lg",
                "focus:outline-none focus:ring-4 focus:ring-gov-gold",
                "placeholder:text-muted-foreground",
                "min-h-[56px]"
              )}
              required
              disabled={loading}
            />
            <p className="text-base text-muted-foreground mt-2">
              Sử dụng số điện thoại của bạn như tên đăng nhập
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-lg font-medium mb-3 text-foreground">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className={cn(
                  "w-full px-5 py-4 rounded-lg border bg-background text-lg pr-12",
                  "focus:outline-none focus:ring-4 focus:ring-gov-gold",
                  "placeholder:text-muted-foreground",
                  "min-h-[56px]"
                )}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !phone || !password}
            className={cn(
              "w-full py-4 px-6 rounded-lg font-semibold relative text-lg",
              "bg-primary-600 text-white",
              "hover:bg-primary-700 transition-colors cursor-pointer",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "min-h-[56px]"
            )}
            style={{ minHeight: 'var(--spacing-touch-lg)' }}
          >
            <span className={loading ? 'opacity-0' : ''}>Đăng nhập</span>
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner size="sm" />
              </span>
            )}
          </button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Nếu chưa có tài khoản, hệ thống sẽ tự động tạo mới khi bạn đăng nhập lần đầu tiên.</p>
          </div>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-8 pt-6 border-t">
            <p className="text-center text-sm text-muted-foreground mb-4">
              Chế độ Kiểm thử (Bỏ qua đăng nhập)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('diensanh:testMode', 'true');
                  localStorage.setItem('diensanh:userDoc', JSON.stringify({
                    uid: 'village-leader-1',
                    phone: '0900000001',
                    displayName: 'Trưởng Thôn An Lợi',
                    role: 'village_leader',
                    villageId: 'village-1',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }));
                  localStorage.setItem('firebase:authUser:[DEFAULT]', JSON.stringify({
                    uid: 'village-leader-1',
                    phoneNumber: '0900000001',
                    displayName: 'Trưởng Thôn An Lợi',
                    emailVerified: false,
                    isAnonymous: false
                  }));
                  window.location.href = '/village';
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
              >
                Trưởng thôn
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('diensanh:testMode', 'true');
                  localStorage.setItem('diensanh:userDoc', JSON.stringify({
                    uid: 'resident-1',
                    phone: '0900000002',
                    displayName: 'Nguyễn Văn A',
                    role: 'resident',
                    villageId: 'village-1',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }));
                  localStorage.setItem('firebase:authUser:[DEFAULT]', JSON.stringify({
                    uid: 'resident-1',
                    phoneNumber: '0900000002',
                    displayName: 'Nguyễn Văn A',
                    emailVerified: false,
                    isAnonymous: false
                  }));
                  window.location.href = '/portal';
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
              >
                Người dân
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
