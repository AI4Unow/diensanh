import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'

// Lazy load all pages for code splitting
const LoginPage = lazy(() => import('@/pages/login').then(m => ({ default: m.LoginPage })))
const AdminDashboardPage = lazy(() => import('@/pages/admin/dashboard').then(m => ({ default: m.AdminDashboardPage })))
const VillageDashboardPage = lazy(() => import('@/pages/village/dashboard').then(m => ({ default: m.VillageDashboardPage })))
const VillagesPage = lazy(() => import('@/pages/admin/villages/index').then(m => ({ default: m.VillagesPage })))
const VillageDetailPage = lazy(() => import('@/pages/admin/villages/[villageId]').then(m => ({ default: m.VillageDetailPage })))
const HouseholdsPage = lazy(() => import('@/pages/admin/households/index').then(m => ({ default: m.HouseholdsPage })))
const HouseholdDetailPage = lazy(() => import('@/pages/admin/households/[householdId]').then(m => ({ default: m.HouseholdDetailPage })))
const HouseholdFormPage = lazy(() => import('@/pages/admin/households/form').then(m => ({ default: m.HouseholdFormPage })))
const ResidentFormPage = lazy(() => import('@/pages/admin/residents/form').then(m => ({ default: m.ResidentFormPage })))
const SMSPage = lazy(() => import('@/pages/admin/sms/index').then(m => ({ default: m.SMSPage })))
const TasksPage = lazy(() => import('@/pages/admin/tasks/index').then(m => ({ default: m.TasksPage })))
const TaskDetailPage = lazy(() => import('@/pages/admin/tasks/[taskId]').then(m => ({ default: m.TaskDetailPage })))
const TaskFormPage = lazy(() => import('@/pages/admin/tasks/form').then(m => ({ default: m.TaskFormPage })))
const PortalHomePage = lazy(() => import('@/pages/portal/index').then(m => ({ default: m.PortalHomePage })))
const AnnouncementsPage = lazy(() => import('@/pages/portal/announcements').then(m => ({ default: m.AnnouncementsPage })))
const RequestFormPage = lazy(() => import('@/pages/portal/request-form').then(m => ({ default: m.RequestFormPage })))
const ChatbotPage = lazy(() => import('@/pages/portal/chatbot').then(m => ({ default: m.ChatbotPage })))
const NotFoundPage = lazy(() => import('@/pages/not-found').then(m => ({ default: m.NotFoundPage })))

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="animate-pulse text-muted-foreground">Đang tải...</div>
    </div>
  )
}

// Protected route wrapper
interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userDoc, loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && userDoc && !allowedRoles.includes(userDoc.role)) {
    if (userDoc.role === 'commune_admin') {
      return <Navigate to="/admin" replace />
    } else if (userDoc.role === 'village_leader') {
      return <Navigate to="/village" replace />
    } else {
      return <Navigate to="/portal" replace />
    }
  }

  return <>{children}</>
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/villages"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <VillagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/villages/:villageId"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <VillageDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/villages/:villageId/households"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <HouseholdsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/villages/:villageId/households/new"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <HouseholdFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/villages/:villageId/households/:householdId"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <HouseholdDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/villages/:villageId/households/:householdId/edit"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <HouseholdFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/villages/:villageId/households/:householdId/residents/new"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <ResidentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/villages/:villageId/households/:householdId/residents/:residentId/edit"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <ResidentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/households"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <HouseholdsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sms"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <SMSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks/new"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <TaskFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks/:taskId"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <TaskDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks/:taskId/edit"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <TaskFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['commune_admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Village leader routes */}
          <Route
            path="/village"
            element={
              <ProtectedRoute allowedRoles={['village_leader']}>
                <VillageDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/village/*"
            element={
              <ProtectedRoute allowedRoles={['village_leader']}>
                <VillageDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Public portal routes - no auth required */}
          <Route path="/portal" element={<PortalHomePage />} />
          <Route path="/portal/announcements" element={<AnnouncementsPage />} />
          <Route path="/portal/requests/new" element={<RequestFormPage />} />
          <Route path="/portal/chatbot" element={<ChatbotPage />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/portal" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
