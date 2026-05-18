import { useState } from 'react'
import { Camera, ExternalLink, AlertTriangle } from 'lucide-react'

function GoProCloud() {
  const [showHelp, setShowHelp] = useState(false)
  const GOPRO_URL = 'https://gopro.com/media-library/'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Camera className="text-white" size={20} />
          </div>
          <h2 className="font-display font-bold text-xl text-warm-900">GoPro Cloud</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-warm-500 hover:text-warm-700"
          >
            {showHelp ? 'Ukryj pomoc' : 'Pomoc'}
          </button>
          <a
            href={GOPRO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            <ExternalLink size={14} />
            Nowa karta
          </a>
        </div>
      </div>

      {/* Help banner */}
      {showHelp && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Jeśli ramka jest pusta lub nie ładuje się:</p>
            <p>
              GoPro może blokować wyświetlanie swojej strony w ramce (ze względów bezpieczeństwa). 
              W takim wypadku kliknij "Nowa karta" aby otworzyć GoPro Media Library w osobnej karcie przeglądarki, 
              pobierz zdjęcia/filmy i dodaj je do dziennika przez "Dodaj wpis".
            </p>
          </div>
        </div>
      )}

      {/* GoPro iframe - pełna wysokość */}
      <div className="rounded-2xl overflow-hidden border border-warm-200 shadow-sm bg-white">
        <iframe
          src={GOPRO_URL}
          className="w-full border-0"
          style={{ height: 'calc(100vh - 160px)', minHeight: '600px' }}
          title="GoPro Media Library"
          allow="camera; microphone; fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}

export default GoProCloud
