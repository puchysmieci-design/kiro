import { useState, useEffect } from 'react'
import api from '../api'
import { Plus, Check, Loader2, ImageIcon, Film, ChevronDown } from 'lucide-react'

function GooglePhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextPageToken, setNextPageToken] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [addingToJournal, setAddingToJournal] = useState(false)
  const [addSuccess, setAddSuccess] = useState(null)
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    profile: 'child',
    milestone: '',
    isMilestone: false,
  })

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async (pageToken = null) => {
    try {
      if (pageToken) setLoadingMore(true)
      else setLoading(true)

      const params = { pageSize: 30 }
      if (pageToken) params.pageToken = pageToken

      const res = await api.get('/api/photos', { params })

      if (pageToken) {
        setPhotos(prev => [...prev, ...res.data.photos])
      } else {
        setPhotos(res.data.photos)
      }
      setNextPageToken(res.data.nextPageToken)
    } catch (err) {
      console.error('Błąd ładowania Google Photos:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const openAddDialog = (photo) => {
    setSelectedPhoto(photo)
    setAddForm({
      title: '',
      description: photo.description || '',
      date: photo.createdAt ? photo.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      profile: 'child',
      milestone: '',
      isMilestone: false,
    })
    setAddSuccess(null)
  }

  const addToJournal = async (e) => {
    e.preventDefault()
    if (!selectedPhoto) return
    setAddingToJournal(true)

    try {
      await api.post('/api/photos/add-to-journal', {
        photoId: selectedPhoto.id,
        photoUrl: selectedPhoto.originalUrl,
        title: addForm.title,
        description: addForm.description,
        date: addForm.date,
        profile: addForm.profile,
        milestone: addForm.isMilestone ? addForm.milestone : null,
      })
      setAddSuccess(selectedPhoto.id)
      setTimeout(() => {
        setSelectedPhoto(null)
        setAddSuccess(null)
      }, 1500)
    } catch (err) {
      console.error('Błąd dodawania do dziennika:', err)
      alert('Nie udało się dodać. Spróbuj ponownie.')
    } finally {
      setAddingToJournal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-warm-500">Ładowanie zdjęć z Google Photos...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-warm-900">Google Zdjęcia</h2>
          <p className="text-warm-500 text-sm">Kliknij zdjęcie aby dodać je do kalendarza dziennika</p>
        </div>
        <div className="text-sm text-warm-400">
          {photos.length} zdjęć załadowanych
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📷</div>
          <h3 className="font-display font-semibold text-xl text-warm-800 mb-2">
            Brak zdjęć w Google Photos
          </h3>
          <p className="text-warm-500">
            Nie znaleziono zdjęć na Twoim koncie Google Photos.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => openAddDialog(photo)}
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all hover:ring-2 hover:ring-primary-400 hover:shadow-md ${
                  addSuccess === photo.id ? 'ring-2 ring-green-400' : ''
                }`}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Video badge */}
                {photo.isVideo && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Film size={10} />
                    Film
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/20 flex items-center justify-center transition-all">
                  <div className="bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 shadow-lg transition-all transform scale-75 group-hover:scale-100">
                    <Plus size={20} className="text-primary-600" />
                  </div>
                </div>
                {/* Added badge */}
                {addSuccess === photo.id && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                    <div className="bg-green-500 rounded-full p-2">
                      <Check size={20} className="text-white" />
                    </div>
                  </div>
                )}
                {/* Date */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs">
                    {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString('pl-PL') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {nextPageToken && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchPhotos(nextPageToken)}
                disabled={loadingMore}
                className="btn-secondary inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ChevronDown size={16} />
                )}
                {loadingMore ? 'Ładowanie...' : 'Załaduj więcej'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Add to Journal Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            {/* Photo preview */}
            <div className="aspect-video rounded-t-2xl overflow-hidden bg-warm-100">
              <img
                src={selectedPhoto.fullUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Form */}
            <form onSubmit={addToJournal} className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg text-warm-900">
                Dodaj do dziennika
              </h3>

              {/* Profile */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddForm({...addForm, profile: 'child'})}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    addForm.profile === 'child'
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-warm-200 text-warm-600'
                  }`}
                >
                  👶 Dziecko
                </button>
                <button
                  type="button"
                  onClick={() => setAddForm({...addForm, profile: 'dog'})}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    addForm.profile === 'dog'
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-warm-200 text-warm-600'
                  }`}
                >
                  🐕 Pies
                </button>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Data</label>
                <input
                  type="date"
                  value={addForm.date}
                  onChange={(e) => setAddForm({...addForm, date: e.target.value})}
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Tytuł (opcjonalnie)</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm({...addForm, title: e.target.value})}
                  placeholder="np. Spacer w parku..."
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Opis (opcjonalnie)</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                  placeholder="Co się wydarzyło?"
                  rows={2}
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                />
              </div>

              {/* Milestone */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.isMilestone}
                  onChange={(e) => setAddForm({...addForm, isMilestone: e.target.checked})}
                  className="w-4 h-4 text-primary-500 border-warm-300 rounded"
                />
                <span className="text-sm text-warm-700">⭐ Kamień milowy</span>
              </label>
              {addForm.isMilestone && (
                <input
                  type="text"
                  value={addForm.milestone}
                  onChange={(e) => setAddForm({...addForm, milestone: e.target.value})}
                  placeholder="np. Pierwsze słowo..."
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addingToJournal}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {addingToJournal ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Dodaję...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Dodaj do kalendarza
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="btn-secondary"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GooglePhotos
