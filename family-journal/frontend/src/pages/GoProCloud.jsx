import { Camera, ExternalLink, Download } from 'lucide-react'

function GoProCloud() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Camera className="text-white" size={32} />
        </div>
        <h2 className="font-display font-bold text-2xl text-warm-900 mb-2">GoPro Cloud</h2>
        <p className="text-warm-500">
          Przeglądaj i pobieraj filmy z chmury GoPro, a następnie dodaj je do dziennika.
        </p>
      </div>

      {/* Main link */}
      <div className="card text-center mb-6">
        <a
          href="https://gopro.com/media-library/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4"
        >
          <Camera size={22} />
          Otwórz GoPro Media Library
          <ExternalLink size={16} />
        </a>
        <p className="text-warm-400 text-sm mt-4">
          Otwiera się w nowej karcie – zaloguj się swoim kontem GoPro
        </p>
      </div>

      {/* Instructions */}
      <div className="card">
        <h3 className="font-display font-semibold text-lg text-warm-800 mb-4">
          Jak dodać film z GoPro do dziennika?
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 font-bold text-primary-600 text-sm">
              1
            </div>
            <div>
              <p className="font-medium text-warm-800">Otwórz GoPro Media Library</p>
              <p className="text-sm text-warm-500">Kliknij przycisk powyżej i zaloguj się swoim kontem GoPro</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 font-bold text-primary-600 text-sm">
              2
            </div>
            <div>
              <p className="font-medium text-warm-800">Pobierz zdjęcie lub film</p>
              <p className="text-sm text-warm-500">Znajdź materiał który chcesz dodać i kliknij ikonę pobierania</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 font-bold text-primary-600 text-sm">
              3
            </div>
            <div>
              <p className="font-medium text-warm-800">Dodaj do dziennika</p>
              <p className="text-sm text-warm-500">Wróć tutaj, kliknij "Dodaj wpis" i wrzuć pobrany plik – trafi na Twój Google Drive</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoProCloud
