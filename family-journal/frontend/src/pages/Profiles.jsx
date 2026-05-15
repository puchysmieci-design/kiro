import { useState, useEffect } from 'react'
import axios from 'axios'
import { Edit, Save, Star, TrendingUp } from 'lucide-react'

function Profiles() {
  const [profiles, setProfiles] = useState({
    child: { name: '', birthDate: '', emoji: '👶', milestones: [] },
    dog: { name: '', birthDate: '', emoji: '🐕', milestones: [] },
  })
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const res = await axios.get('/api/profiles')
      if (res.data) setProfiles(res.data)
    } catch (err) {
      console.error('Błąd ładowania profili:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (type) => {
    try {
      await axios.put(`/api/profiles/${type}`, profiles[type])
      setEditing(null)
    } catch (err) {
      console.error('Błąd zapisu profilu:', err)
    }
  }

  const updateProfile = (type, field, value) => {
    setProfiles(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }))
  }

  if (loading) {
    return (
      <div className="sm:ml-56 flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  const ProfileCard = ({ type, label }) => {
    const profile = profiles[type]
    const isEditing = editing === type

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{profile.emoji}</span>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile(type, 'name', e.target.value)}
                  placeholder={`Imię ${label.toLowerCase()}`}
                  className="text-xl font-display font-bold text-warm-900 border-b-2 border-primary-300 focus:outline-none bg-transparent"
                />
              ) : (
                <h3 className="font-display font-bold text-xl text-warm-900">
                  {profile.name || `Imię ${label.toLowerCase()}`}
                </h3>
              )}
              <p className="text-warm-500 text-sm">{label}</p>
            </div>
          </div>
          
          {isEditing ? (
            <button
              onClick={() => saveProfile(type)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Save size={16} />
              Zapisz
            </button>
          ) : (
            <button
              onClick={() => setEditing(type)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Edit size={16} />
              Edytuj
            </button>
          )}
        </div>

        {isEditing && (
          <div className="space-y-4 mb-6 p-4 bg-warm-50 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Data urodzenia</label>
              <input
                type="date"
                value={profile.birthDate}
                onChange={(e) => updateProfile(type, 'birthDate', e.target.value)}
                className="w-full border border-warm-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>
        )}

        {/* Milestones List */}
        <div className="mt-4">
          <h4 className="flex items-center gap-2 font-medium text-warm-700 mb-3">
            <Star className="text-primary-400" size={16} />
            Kamienie milowe
          </h4>
          {profile.milestones && profile.milestones.length > 0 ? (
            <div className="space-y-2">
              {profile.milestones.map((milestone, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-primary-50/50 rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                  <span className="text-sm font-medium text-warm-700">{milestone.title}</span>
                  <span className="text-xs text-warm-400 ml-auto">{milestone.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-warm-400 text-sm italic">
              Brak kamieni milowych. Dodaj je przy tworzeniu wpisu!
            </p>
          )}
        </div>

        {/* Age / Stats */}
        {profile.birthDate && (
          <div className="mt-4 p-4 bg-warm-50 rounded-xl">
            <div className="flex items-center gap-2 text-warm-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">
                Wiek: {calculateAge(profile.birthDate)}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="sm:ml-56">
      <h2 className="font-display font-bold text-2xl text-warm-900 mb-6">Profile</h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCard type="child" label="Dziecko" />
        <ProfileCard type="dog" label="Pies" />
      </div>
    </div>
  )
}

function calculateAge(birthDate) {
  const today = new Date()
  const birth = new Date(birthDate)
  const diffMs = today - birth
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (days < 30) return `${days} dni`
  
  const months = Math.floor(days / 30.44)
  if (months < 12) return `${months} miesięcy`
  
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years} lat`
  return `${years} lat i ${remainingMonths} mies.`
}

export default Profiles
