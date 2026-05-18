import { useState } from 'react'
import { ExternalLink, Camera, Download, Info } from 'lucide-react'

function GoProCloud() {
  const [iframeError, setIframeError] = useState(false)
  const GOPRO_URL = 'https://gopro.com/media-library/'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Camera className="text-white" size={22} />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-warm-900">GoPro Cloud</h2>
            <p className="text-warm-500 text-sm">Przeglądaj multimedia z chmury GoPro</p>
          </div>
        </div>
        <a
          href={GOPRO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center gap-2"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">Otwórz w nowej karcie</span>
        </a>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-start gap-3">
        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Podgląd GoPro Media Library</p>
          <p>
            Jeśli ramka się nie ładuje, kliknij "Otwórz w nowej karcie" powyżej. 
            Możesz pobrać zdjęcia/filmy z GoPro i dodać je do dziennika przez zakładkę "Dodaj wpis".
          </p>
        </div>
      </div>

      {/* Iframe or fallback */}
      {iframeError ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📷</div>
          <h3 className="font-display font-semibold text-xl text-warm-800 mb-3">
            GoPro Media Library
          </h3>
          <p className="text-warm-500 mb-6 max-w-md mx-auto">
            GoPro nie pozwala na osadzanie swojej strony w ramce. 
            Kliknij poniżej aby otworzyć bibliotekę mediów w nowej karcie.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={GOPRO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 justify-center"
            >
              <Camera size={18} />
              Otwórz GoPro Media Library
            </a>
            <a
              href="https://gopro.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2 justify-center"
            >
              <ExternalLink size={16} />
              Zaloguj się do GoPro
            </a>
          </div>

          {/* Quick tips */}
          <div className="mt-10 pt-6 border-t border-warm-100 max-w-lg mx-auto">
            <h4 className="font-medium text-warm-700 mb-4">Jak dodać zdjęcia z GoPro do dziennika?</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-warm-50 rounded-xl">
                <div className="text-2xl mb-2">1️⃣</div>
                <p className="text-sm text-warm-600">Otwórz GoPro Media Library i pobierz zdjęcia/filmy</p>
              </div>
              <div className="p-4 bg-warm-50 rounded-xl">
                <div className="text-2xl mb-2">2️⃣</div>
                <p className="text-sm text-warm-600">Przejdź do zakładki "Dodaj wpis" w dzienniku</p>
              </div>
              <div className="p-4 bg-warm-50 rounded-xl">
                <div className="text-2xl mb-2">3️⃣</div>
                <p className="text-sm text-warm-600">Wrzuć pobrane pliki – trafią na Twój Google Drive</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-warm-200 shadow-sm bg-white">
          <iframe
            src={GOPRO_URL}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}
            title="GoPro Media Library"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            onError={() => setIframeError(true)}
            onLoad={(e) => {
              // Jeśli iframe jest pusty lub zablokowany, pokaż fallback
              try {
                const doc = e.target.contentDocument
                if (!doc || doc.body.innerHTML === '') {
                  setIframeError(true)
                }
              } catch {
                // Cross-origin - iframe załadowany (dobrze)
              }
            }}
          />
        </div>
      )}

      {/* Fallback timer - jeśli iframe nie załaduje w 5s, pokaż fallback */}
      <IframeTimeout onTimeout={() => setIframeError(true)} />
    </div>
  )
}

// Komponent timeout - jeśli po 5 sekundach iframe nie załadował, pokaż fallback
function IframeTimeout({ onTimeout }) {
  const [triggered, setTriggered] = useState(false)
  
  if (!triggered) {
    setTimeout(() => {
      setTriggered(true)
      // Sprawdź czy iframe się załadował
      const iframe = document.querySelector('iframe[title="GoPro Media Library"]')
      if (iframe) {
        try {
          // Jeśli możemy dostać contentDocument = same origin = prawdopodobnie zablokowane
          const doc = iframe.contentDocument
          if (doc && (doc.body.innerHTML === '' || doc.body.innerHTML.includes('refused'))) {
            onTimeout()
          }
        } catch {
          // Cross-origin = iframe się załadował (OK)
        }
      }
    }, 5000)
  }

  return null
}

export default GoProCloud
