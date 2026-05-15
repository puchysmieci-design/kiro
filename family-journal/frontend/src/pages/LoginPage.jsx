import { Heart, Camera, Star, Shield } from 'lucide-react'

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-warm-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="font-display font-bold text-3xl text-warm-900 mb-2">
            Nasz Dziennik Rodzinny
          </h1>
          <p className="text-warm-600 text-lg">
            Zapisuj najpiękniejsze wspomnienia Twojej rodziny
          </p>
        </div>

        {/* Login Card */}
        <div className="card text-center">
          <h2 className="font-display font-semibold text-xl text-warm-800 mb-4">
            Witaj! 👋
          </h2>
          <p className="text-warm-600 mb-6">
            Zaloguj się kontem Google, aby uzyskać dostęp do dziennika. Wszystkie zdjęcia i wpisy są bezpiecznie przechowywane na Twoim Dysku Google.
          </p>
          
          <a
            href="/auth/google"
            className="inline-flex items-center gap-3 bg-white border-2 border-warm-200 hover:border-primary-300 hover:bg-primary-50 px-6 py-3 rounded-xl font-medium text-warm-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Zaloguj się przez Google
          </a>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Camera className="text-primary-600" size={20} />
            </div>
            <p className="text-sm text-warm-600 font-medium">Zdjęcia i filmy</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="text-primary-600" size={20} />
            </div>
            <p className="text-sm text-warm-600 font-medium">Kamienie milowe</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="text-primary-600" size={20} />
            </div>
            <p className="text-sm text-warm-600 font-medium">Wspomnienia</p>
          </div>
          <div className="text-center p-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="text-primary-600" size={20} />
            </div>
            <p className="text-sm text-warm-600 font-medium">Prywatność</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
