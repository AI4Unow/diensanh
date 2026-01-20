import { LoginForm } from '@/components/auth/login-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, userDoc, loading } = useAuth()

  useEffect(() => {
    if (!loading && user && userDoc) {
      console.log('[Login Redirect] Checking user role:', userDoc.role, userDoc)
      // Redirect based on role
      if (userDoc.role === 'commune_admin') {
        console.log('[Login Redirect] Redirecting to /admin')
        navigate('/admin')
      } else if (userDoc.role === 'village_leader') {
        console.log('[Login Redirect] Redirecting to /village')
        navigate('/village')
      } else {
        console.log('[Login Redirect] Redirecting to /portal')
        navigate('/portal')
      }
    }
  }, [user, userDoc, loading, navigate])

  const handleSuccess = () => {
    // Auth context will handle redirect
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
