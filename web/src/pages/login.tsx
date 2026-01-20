import { LoginForm } from '@/components/auth/login-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
export function LoginPage() {
  const navigate = useNavigate()
  const { loading } = useAuth()

  // Auto-redirect removed to prevent race conditions with session cleanup.
  // Navigation is now handled by handleSuccess after explicit login.

  const handleSuccess = (data: any) => {
    // Auth context will handle redirect - BUT we do it manually here to ensure immediate feedback
    // data contains { user, userDoc } from useLoginMutation
    if (data?.userDoc) {
      const role = data.userDoc.role
      console.log('[Login Success] Redirecting based on role:', role)
      if (role === 'commune_admin') {
        navigate('/admin')
      } else if (role === 'village_leader') {
        navigate('/village')
      } else {
        navigate('/portal')
      }
    } else {
      // Fallback if no doc (new user?) -> Portal
      navigate('/portal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-pulse text-muted-foreground">
          Đang tải...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gov-blue-light to-white p-4">
      <LoginForm onSuccess={handleSuccess} />
    </div>
  )
}
