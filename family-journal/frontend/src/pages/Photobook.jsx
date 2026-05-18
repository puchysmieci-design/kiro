import { useState, useEffect } from 'react'
import api from '../api'
import { Plus, BookOpen, Trash2, Image, GripVertical, Download } from 'lucide-react'

function Photobook() {
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [availablePhotos, setAvailablePhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewBookForm, setShowNewBookForm] = useState(false)
  const [newBookTitle, setNewBookTitle] = useState('')
  const [newBookDescription, setNewBookDescription] = useState('')

  useEffect(() => {
    fetchBooks()
    fetchPhotos()
  }, [])

  const fetchBooks = async () => {
    try {
      const res = await api.get('/api/photobooks')
      setBooks(res.data)
    } catch (err) {
      console.error('Błąd ładowania fotoksiążek:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotos = async () => {
    try {
      const res = await api.get('/api/gallery')
      setAvailablePhotos(res.data)
    } catch (err) {
      console.error('Błąd ładowania zdjęć:', err)
    }
  }

  const createBook = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/photobooks', {
        title: newBookTitle,
        description: newBookDescription,
      })
      setBooks([...books, res.data])
      setNewBookTitle('')
      setNewBookDescription('')
      setShowNewBookForm(false)
    } catch (err) {
      console.error('Błąd tworzenia fotoksiążki:', err)
    }
  }

  const deleteBook = async (bookId) => {
    if (!confirm('Czy na pewno chcesz usunąć tę fotoksiążkę?')) return
    try {
      await api.delete(`/api/photobooks/${bookId}`)
      setBooks(books.filter(b => b.id !== bookId))
      if (selectedBook?.id === bookId) setSelectedBook(null)
    } catch (err) {
      console.error('Błąd usuwania:', err)
    }
  }

  const addPhotoToBook = async (photo) => {
    if (!selectedBook) return
    try {
      const updatedPages = [...(selectedBook.pages || []), {
        id: `page-${Date.now()}`,
        imageUrl: photo.imageUrl,
        thumbnailUrl: photo.thumbnailUrl,
        caption: photo.title || '',
        date: photo.date,
      }]
      
      await api.put(`/api/photobooks/${selectedBook.id}`, {
        ...selectedBook,
        pages: updatedPages,
      })
      
      const updated = { ...selectedBook, pages: updatedPages }
      setSelectedBook(updated)
      setBooks(books.map(b => b.id === updated.id ? updated : b))
    } catch (err) {
      console.error('Błąd dodawania strony:', err)
    }
  }

  const removePageFromBook = async (pageId) => {
    if (!selectedBook) return
    const updatedPages = selectedBook.pages.filter(p => p.id !== pageId)
    try {
      await api.put(`/api/photobooks/${selectedBook.id}`, {
        ...selectedBook,
        pages: updatedPages,
      })
      const updated = { ...selectedBook, pages: updatedPages }
      setSelectedBook(updated)
      setBooks(books.map(b => b.id === updated.id ? updated : b))
    } catch (err) {
      console.error('Błąd usuwania strony:', err)
    }
  }

  const updateCaption = async (pageId, caption) => {
    if (!selectedBook) return
    const updatedPages = selectedBook.pages.map(p => 
      p.id === pageId ? { ...p, caption } : p
    )
    const updated = { ...selectedBook, pages: updatedPages }
    setSelectedBook(updated)
    setBooks(books.map(b => b.id === updated.id ? updated : b))
    
    // Debounced save
    try {
      await api.put(`/api/photobooks/${selectedBook.id}`, updated)
    } catch (err) {
      console.error('Błąd zapisu:', err)
    }
  }

  if (loading) {
    return (
      <div className="sm:ml-56 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  // Widok szczegółowy fotoksiążki
  if (selectedBook) {
    return (
      <div className="sm:ml-56">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button 
              onClick={() => setSelectedBook(null)}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium mb-1"
            >
              ← Wróć do listy
            </button>
            <h2 className="font-display font-bold text-2xl text-warm-900">{selectedBook.title}</h2>
            {selectedBook.description && (
              <p className="text-warm-500 text-sm">{selectedBook.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <span className="text-sm text-warm-400">
              {selectedBook.pages?.length || 0} stron
            </span>
          </div>
        </div>

        {/* Strony fotoksiążki */}
        <div className="mb-8">
          {selectedBook.pages && selectedBook.pages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedBook.pages.map((page, idx) => (
                <div key={page.id} className="card overflow-hidden group">
                  <div className="relative">
                    <img 
                      src={page.imageUrl} 
                      alt={page.caption} 
                      className="w-full aspect-[4/3] object-cover rounded-lg"
                    />
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {idx + 1}
                    </div>
                    <button
                      onClick={() => removePageFromBook(page.id)}
                      className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-3">
                    <input
                      type="text"
                      value={page.caption}
                      onChange={(e) => updateCaption(page.id, e.target.value)}
                      placeholder="Dodaj podpis..."
                      className="w-full text-sm border-b border-warm-200 focus:border-primary-400 focus:outline-none pb-1 text-warm-700 placeholder:text-warm-300"
                    />
                    {page.date && (
                      <p className="text-xs text-warm-400 mt-1">{page.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <BookOpen className="mx-auto text-warm-300 mb-3" size={40} />
              <p className="text-warm-500">Ta fotoksiążka jest pusta. Dodaj zdjęcia z galerii poniżej.</p>
            </div>
          )}
        </div>

        {/* Dostępne zdjęcia do dodania */}
        <div className="border-t border-warm-100 pt-6">
          <h3 className="font-display font-semibold text-lg text-warm-800 mb-4">
            Dodaj zdjęcia z galerii
          </h3>
          {availablePhotos.length === 0 ? (
            <p className="text-warm-400 text-sm">Brak dostępnych zdjęć. Dodaj wpisy ze zdjęciami.</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {availablePhotos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => addPhotoToBook(photo)}
                  className="aspect-square rounded-lg overflow-hidden hover:opacity-75 hover:ring-2 hover:ring-primary-400 transition-all relative group"
                >
                  <img 
                    src={photo.thumbnailUrl} 
                    alt={photo.title || ''} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/20 flex items-center justify-center transition-all">
                    <Plus className="text-white opacity-0 group-hover:opacity-100" size={24} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Lista fotoksiążek
  return (
    <div className="sm:ml-56">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-warm-900">Fotoksiążki</h2>
          <p className="text-warm-500 text-sm">Twórz albumy z najpiękniejszych chwil</p>
        </div>
        <button 
          onClick={() => setShowNewBookForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nowa fotoksiążka</span>
        </button>
      </div>

      {/* Formularz nowej fotoksiążki */}
      {showNewBookForm && (
        <div className="card mb-6">
          <h3 className="font-display font-semibold text-lg text-warm-800 mb-4">Nowa fotoksiążka</h3>
          <form onSubmit={createBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Tytuł</label>
              <input
                type="text"
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                placeholder="np. Pierwsze wakacje, Urodziny..."
                required
                className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Opis (opcjonalnie)</label>
              <input
                type="text"
                value={newBookDescription}
                onChange={(e) => setNewBookDescription(e.target.value)}
                placeholder="Krótki opis albumu..."
                className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Utwórz</button>
              <button 
                type="button" 
                onClick={() => setShowNewBookForm(false)}
                className="btn-secondary"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista fotoksiążek */}
      {books.length === 0 && !showNewBookForm ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📖</div>
          <h3 className="font-display font-semibold text-xl text-warm-800 mb-2">
            Brak fotoksiążek
          </h3>
          <p className="text-warm-500 mb-6">
            Stwórz swoją pierwszą fotoksiążkę i zbierz najlepsze wspomnienia w jednym albumie!
          </p>
          <button 
            onClick={() => setShowNewBookForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Utwórz pierwszą fotoksiążkę
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map(book => (
            <div 
              key={book.id} 
              className="card hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Cover */}
              <div 
                onClick={() => setSelectedBook(book)}
                className="aspect-[3/2] rounded-xl overflow-hidden bg-warm-100 mb-4 relative"
              >
                {book.pages && book.pages.length > 0 ? (
                  <img 
                    src={book.pages[0].thumbnailUrl || book.pages[0].imageUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="text-warm-300" size={48} />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {book.pages?.length || 0} stron
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start justify-between">
                <div onClick={() => setSelectedBook(book)} className="flex-1">
                  <h3 className="font-display font-semibold text-warm-900">{book.title}</h3>
                  {book.description && (
                    <p className="text-sm text-warm-500 mt-1">{book.description}</p>
                  )}
                  <p className="text-xs text-warm-400 mt-2">
                    Utworzono: {new Date(book.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteBook(book.id) }}
                  className="text-warm-300 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Photobook
