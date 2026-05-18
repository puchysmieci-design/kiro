import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, Image, Users, Baby, BookOpen, UserPlus, LogOut, Menu, X, PlusCircle } from 'lucide-react'
import { useState } from 'react'

function Layout({ user, children }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/kalendarz', label: 'Kalendarz', icon: CalendarDays },
    { path: '/galeria', label: 'Albumy', icon: Image },
    { path: '/rodzina', label: 'Rodzina', icon: Users },
    { path: '/profile', label: 'Dzieci i pies', icon: Baby },
    { path: '/fotoksiazki', label: 'Fotoksiążki', icon: BookOpen },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-warm-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🌟</span>
              <h1 className="font-display font-bold text-lg text-primary-600 hidden sm:block">
                Nasz Dziennik
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-warm-600 hover:text-warm-900 hover:bg-warm-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right side: Add button + User */}
            <div className="flex items-center gap-3">
              <Link
                to="/dodaj"
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Dodaj wpis</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-warm-100">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm text-warm-700 font-medium max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>

              <a 
                href="/auth/logout" 
                className="text-warm-400 hover:text-warm-600 transition-colors"
                title="Wyloguj"
              >
                <LogOut size={18} />
              </a>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-warm-600 p-1"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-warm-100 bg-white py-2 px-4">
            <nav className="space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(path)
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-warm-600 hover:bg-warm-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-2 pt-2 border-t border-warm-100 flex items-center gap-2 px-4 py-2">
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              <span className="text-sm text-warm-700">{user.name}</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-6">
        {children}
      </main>
    </div>
  )
}

export default Layout
