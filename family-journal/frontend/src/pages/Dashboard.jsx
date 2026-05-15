import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { PlusCircle, Heart, MessageCircle, Calendar } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('pl')

function Dashboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/entries')
      setEntries(res.data)
    } catch (err) {
      console.error('Błąd ładowania wpisów:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="sm:ml-56">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="sm:ml-56">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-warm-900">Oś czasu</h2>
          <p className="text-warm-500 text-sm">Najnowsze wspomnienia Twojej rodziny</p>
        </div>
        <Link to="/dodaj" className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Nowy wpis</span>
        </Link>
      </div>

      {/* Timeline */}
      {entries.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📸</div>
          <h3 className="font-display font-semibold text-xl text-warm-800 mb-2">
            Twój dziennik jest jeszcze pusty
          </h3>
          <p className="text-warm-500 mb-6">
            Dodaj pierwszy wpis, aby rozpocząć kolekcjonowanie wspomnień!
          </p>
          <Link to="/dodaj" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle size={18} />
            Dodaj pierwszy wpis
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <article key={entry.id} className="timeline-card">
              {/* Entry Image */}
              {entry.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Entry Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{entry.profileEmoji || '👶'}</span>
                  <span className="text-sm font-medium text-warm-600">{entry.profileName}</span>
                  <span className="text-warm-300">•</span>
                  <span className="text-sm text-warm-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {dayjs(entry.date).format('D MMMM YYYY')}
                  </span>
                </div>
                
                {entry.title && (
                  <h3 className="font-display font-semibold text-lg text-warm-900 mb-1">
                    {entry.title}
                  </h3>
                )}
                
                {entry.description && (
                  <p className="text-warm-600 leading-relaxed">{entry.description}</p>
                )}

                {entry.milestone && (
                  <div className="mt-3 inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full">
                    ⭐ Kamień milowy: {entry.milestone}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-warm-50">
                  <button className="flex items-center gap-1 text-warm-400 hover:text-red-400 transition-colors">
                    <Heart size={18} />
                    <span className="text-sm">{entry.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 text-warm-400 hover:text-primary-500 transition-colors">
                    <MessageCircle size={18} />
                    <span className="text-sm">{entry.comments?.length || 0}</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
