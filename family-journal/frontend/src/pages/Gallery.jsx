import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const res = await axios.get('/api/gallery')
      setImages(res.data)
    } catch (err) {
      console.error('Błąd ładowania galerii:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = images.filter(img => {
    if (filter === 'all') return true
    return img.profile === filter
  })

  const openLightbox = (index) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % filteredImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)
  }

  if (loading) {
    return (
      <div className="sm:ml-56 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="sm:ml-56">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl text-warm-900">Galeria</h2>
        
        {/* Filter */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Wszystko' },
            { key: 'child', label: '👶 Dziecko' },
            { key: 'dog', label: '🐕 Pies' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-primary-500 text-white'
                  : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🖼️</div>
          <h3 className="font-display font-semibold text-xl text-warm-800 mb-2">
            Brak zdjęć
          </h3>
          <p className="text-warm-500">
            Dodaj wpisy ze zdjęciami, aby zobaczyć je tutaj.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
            >
              <img
                src={image.thumbnailUrl}
                alt={image.title || 'Zdjęcie'}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={32} />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 text-white/80 hover:text-white"
          >
            <ChevronLeft size={40} />
          </button>
          
          <img
            src={filteredImages[selectedImage].imageUrl}
            alt={filteredImages[selectedImage].title || ''}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          />
          
          <button
            onClick={nextImage}
            className="absolute right-4 text-white/80 hover:text-white"
          >
            <ChevronRight size={40} />
          </button>

          <div className="absolute bottom-4 text-center text-white">
            <p className="font-medium">{filteredImages[selectedImage].title}</p>
            <p className="text-sm text-white/60">{filteredImages[selectedImage].date}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
