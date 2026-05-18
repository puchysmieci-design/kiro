import { Link, useLocation } from 'react-router-dom'
import { Home, PlusCircle, Users, Image, CalendarDays, BookOpen, LogOut } from 'lucide-react'

function Layout({ user, children }) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Główna', icon: Home },
    { path: '/dodaj', label: 'Dodaj', icon: PlusCircle },
    { path: '/profile', label: 'Profile', icon: Users },
    { path: '/galeria', label: 'Galeria', icon: Image },
    { path: '/kalendarz', label: 'Kalendarz', icon: CalendarDays },
    { path: '/fotoksiazki', label: 'Fotoksiążki', icon: BookOpen },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🌟</span>
            <h1 className="font-display font-bold text-xl text-warm-900">
              Nasz Dziennik
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-warm-700 font-medium">{user.name}</span>
            </div>
            <a 
              href="/auth/logout" 
              className="text-warm-500 hover:text-warm-700 transition-colors"
              title="Wyloguj"
            >
              <LogOut size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 sm:pb-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 sm:hidden z-50">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive(path)
                  ? 'text-primary-500'
                  : 'text-warm-400 hover:text-warm-600'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden sm:block fixed left-0 top-16 bottom-0 w-56 bg-white border-r border-warm-100 p-4">
        <nav className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(path)
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-warm-600 hover:bg-warm-50 hover:text-warm-800'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  )
}

export default Layout
