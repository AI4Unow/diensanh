import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Trang không tồn tại
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
