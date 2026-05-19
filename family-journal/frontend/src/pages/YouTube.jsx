import { useState, useEffect } from 'react'
import api from '../api'
import { Play, Plus, Film, Eye, Calendar, Loader2, X } from 'lucide-react'

function YouTube() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [playingVideo, setPlayingVideo] = useState(null)
  const [addingToJournal, setAddingToJournal] = useState(false)
  const [addForm, setAddForm] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    profile: 'child',
  })

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await api.get('/api/youtube')
      setVideos(res.data)
    } catch (err) {
      console.error('Błąd ładowania filmów z YouTube:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToJournal = async (video) => {
    setAddingToJournal(true)
    try {
      await api.post('/api/youtube/add-to-journal', {
        videoId: video.id,
        title: video.title,
        description: addForm.description || video.description,
        date: addForm.date,
        profile: addForm.profile,
        thumbnailUrl: video.thumbnail,
        youtubeUrl: video.url,
      })
      setSelectedVideo(null)
      alert('Film dodany do dziennika!')
    } catch (err) {
      console.error('Błąd dodawania:', err)
      alert('Nie udało się dodać. Spróbuj ponownie.')
    } finally {
      setAddingToJournal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-warm-500">Ładowanie filmów z YouTube...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <Play className="text-white fill-white" size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-warm-900">YouTube</h2>
            <p className="text-warm-500 text-sm">Filmy z Twojego kanału</p>
          </div>
        </div>
        <a
          href="https://www.youtube.com/@PUCZATOR"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-red-500 hover:text-red-600 font-medium"
        >
          Otwórz kanał →
        </a>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="font-display font-semibold text-xl text-warm-800 mb-2">
            Brak filmów
          </h3>
          <p className="text-warm-500">
            Nie znaleziono filmów na Twoim kanale YouTube.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(video => (
            <div key={video.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div 
                className="relative aspect-video rounded-lg overflow-hidden cursor-pointer mb-3"
                onClick={() => setPlayingVideo(video)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="text-white fill-white ml-1" size={24} />
                  </div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="font-medium text-warm-900 text-sm line-clamp-2 mb-2">
                {video.title}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-warm-400">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {video.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(video.publishedAt).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedVideo(video)
                    setAddForm({
                      description: '',
                      date: video.publishedAt ? video.publishedAt.split('T')[0] : new Date().toISOString().split('T')[0],
                      profile: 'child',
                    })
                  }}
                  className="text-primary-500 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-all"
                  title="Dodaj do dziennika"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPlayingVideo(null)}>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium truncate pr-4">{playingVideo.title}</h3>
              <button onClick={() => setPlayingVideo(null)} className="text-white/70 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${playingVideo.id}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={playingVideo.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add to Journal Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="font-display font-semibold text-lg text-warm-900 mb-1">
                Dodaj film do dziennika
              </h3>
              <p className="text-sm text-warm-500 mb-4 truncate">{selectedVideo.title}</p>

              <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-warm-100">
                <img src={selectedVideo.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3">
                {/* Profile */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddForm({...addForm, profile: 'child'})}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm ${
                      addForm.profile === 'child' ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-warm-200 text-warm-600'
                    }`}
                  >
                    👶 Dziecko
                  </button>
                  <button
                    onClick={() => setAddForm({...addForm, profile: 'dog'})}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm ${
                      addForm.profile === 'dog' ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-warm-200 text-warm-600'
                    }`}
                  >
                    🐕 Pies
                  </button>
                </div>

                {/* Date */}
                <input
                  type="date"
                  value={addForm.date}
                  onChange={(e) => setAddForm({...addForm, date: e.target.value})}
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />

                {/* Description */}
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                  placeholder="Opis (opcjonalnie)..."
                  rows={2}
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => addToJournal(selectedVideo)}
                  disabled={addingToJournal}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {addingToJournal ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {addingToJournal ? 'Dodaję...' : 'Dodaj do kalendarza'}
                </button>
                <button onClick={() => setSelectedVideo(null)} className="btn-secondary">
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default YouTube
