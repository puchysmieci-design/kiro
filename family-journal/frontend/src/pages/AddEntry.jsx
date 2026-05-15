import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { Upload, X, Image, Star } from 'lucide-react'

function AddEntry() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    profile: 'child',
    milestone: '',
    isMilestone: false,
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
      reader.readAsDataURL(selectedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const formData = new FormData()
      if (file) formData.append('media', file)
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('date', form.date)
      formData.append('profile', form.profile)
      if (form.isMilestone) formData.append('milestone', form.milestone)

      await api.post('/api/entries', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate('/')
    } catch (err) {
      console.error('Błąd dodawania wpisu:', err)
      alert('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="sm:ml-56 max-w-2xl">
      <h2 className="font-display font-bold text-2xl text-warm-900 mb-6">
        Nowy wpis
      </h2>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Profile Selection */}
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-2">Kogo dotyczy?</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm({...form, profile: 'child'})}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                form.profile === 'child'
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-warm-200 text-warm-600 hover:border-warm-300'
              }`}
            >
              <span className="text-xl">👶</span>
              <span className="font-medium">Dziecko</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({...form, profile: 'dog'})}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                form.profile === 'dog'
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-warm-200 text-warm-600 hover:border-warm-300'
              }`}
            >
              <span className="text-xl">🐕</span>
              <span className="font-medium">Pies</span>
            </button>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-2">Data</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({...form, date: e.target.value})}
            className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-2">Tytuł (opcjonalnie)</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="np. Pierwsze kroki, Wizyta u weterynarza..."
            className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-2">Opis</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Co się dzisiaj wydarzyło?"
            rows={4}
            className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-2">Zdjęcie lub film</label>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={preview} alt="Podgląd" className="w-full max-h-64 object-cover" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-warm-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
              <Image className="text-warm-400 mb-2" size={32} />
              <span className="text-warm-500 font-medium">Kliknij aby dodać zdjęcie</span>
              <span className="text-warm-400 text-sm">JPG, PNG, MP4 do 20MB</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Milestone Toggle */}
        <div className="border border-warm-100 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isMilestone}
              onChange={(e) => setForm({...form, isMilestone: e.target.checked})}
              className="w-5 h-5 text-primary-500 border-warm-300 rounded focus:ring-primary-300"
            />
            <Star className="text-primary-400" size={20} />
            <span className="font-medium text-warm-700">To jest kamień milowy!</span>
          </label>
          
          {form.isMilestone && (
            <input
              type="text"
              value={form.milestone}
              onChange={(e) => setForm({...form, milestone: e.target.value})}
              placeholder="np. Pierwsze słowo, Pierwszy spacer..."
              className="w-full border border-warm-200 rounded-xl px-4 py-3 mt-3 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Zapisuję na Google Drive...
            </>
          ) : (
            <>
              <Upload size={18} />
              Zapisz wpis
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default AddEntry
