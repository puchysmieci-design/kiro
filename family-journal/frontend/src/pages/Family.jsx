import { useState, useEffect } from 'react'
import api from '../api'
import { UserPlus, Trash2, Mail, Shield, Eye, Edit2, Check } from 'lucide-react'

function Family() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRelation, setInviteRelation] = useState('rodzic')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [inviteSent, setInviteSent] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await api.get('/api/family')
      setMembers(res.data)
    } catch (err) {
      console.error('Błąd ładowania rodziny:', err)
    } finally {
      setLoading(false)
    }
  }

  const inviteMember = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/family', {
        email: inviteEmail,
        name: inviteName,
        relation: inviteRelation,
        role: inviteRole,
      })
      setMembers([...members, res.data])
      setInviteEmail('')
      setInviteName('')
      setInviteRelation('rodzic')
      setInviteRole('viewer')
      setInviteSent(true)
      setTimeout(() => {
        setInviteSent(false)
        setShowInviteForm(false)
      }, 2000)
    } catch (err) {
      console.error('Błąd zapraszania:', err)
      alert('Nie udało się zaprosić. Spróbuj ponownie.')
    }
  }

  const removeMember = async (memberId) => {
    if (!confirm('Czy na pewno chcesz usunąć tę osobę z dziennika?')) return
    try {
      await api.delete(`/api/family/${memberId}`)
      setMembers(members.filter(m => m.id !== memberId))
    } catch (err) {
      console.error('Błąd usuwania:', err)
    }
  }

  const updateMemberRole = async (memberId, newRole) => {
    try {
      await api.put(`/api/family/${memberId}`, { role: newRole })
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m))
    } catch (err) {
      console.error('Błąd aktualizacji:', err)
    }
  }

  const relations = [
    { value: 'rodzic', label: 'Rodzic' },
    { value: 'dziadek', label: 'Dziadek/Babcia' },
    { value: 'wujek', label: 'Wujek/Ciocia' },
    { value: 'przyjaciel', label: 'Przyjaciel/ka' },
    { value: 'opiekun', label: 'Opiekun/ka' },
    { value: 'inny', label: 'Inny' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-warm-900 mb-2">Rodzina i znajomi</h2>
        <p className="text-warm-500">
          Udostępnij wspomnienia bliskim osobom. Zaproszone osoby mogą przeglądać dziennik.
        </p>
      </div>

      {/* Invite Button */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowInviteForm(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <UserPlus size={18} />
          Zaproś rodzinę lub znajomych
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="card mb-8">
          {inviteSent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="text-green-600" size={24} />
              </div>
              <h3 className="font-display font-semibold text-lg text-warm-800">Zaproszenie dodane!</h3>
              <p className="text-warm-500 text-sm mt-1">Osoba będzie mogła przeglądać dziennik po zalogowaniu.</p>
            </div>
          ) : (
            <>
              <h3 className="font-display font-semibold text-lg text-warm-800 mb-4">
                Zaproś nową osobę
              </h3>
              <form onSubmit={inviteMember} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Imię</label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="np. Babcia Ela"
                      required
                      className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Kim jest dla dziecka?</label>
                    <select
                      value={inviteRelation}
                      onChange={(e) => setInviteRelation(e.target.value)}
                      className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                      {relations.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Uprawnienia</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                      <option value="viewer">Tylko podgląd</option>
                      <option value="commenter">Podgląd + komentarze</option>
                      <option value="editor">Może dodawać wpisy</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex items-center gap-2">
                    <Mail size={16} />
                    Zaproś
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="btn-secondary"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="card text-center py-10">
            <div className="text-5xl mb-4">👨‍👩‍👧</div>
            <h3 className="font-display font-semibold text-xl text-warm-800 mb-2">
              Jeszcze nikt nie dołączył
            </h3>
            <p className="text-warm-500">
              Zaproś babcię, dziadka, ciocię lub przyjaciół aby mogli oglądać wspomnienia!
            </p>
          </div>
        ) : (
          members.map(member => (
            <div key={member.id} className="card flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center shrink-0">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <span className="text-2xl">
                    {member.relation === 'dziadek' ? '👴' :
                     member.relation === 'rodzic' ? '👩' :
                     member.relation === 'wujek' ? '🧑' :
                     member.relation === 'przyjaciel' ? '🤗' : '👤'}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-warm-900">{member.name}</h4>
                <p className="text-sm text-warm-500">{member.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-warm-100 text-warm-600 px-2 py-0.5 rounded-full">
                    {relations.find(r => r.value === member.relation)?.label || member.relation}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    member.role === 'editor' ? 'bg-green-50 text-green-700' :
                    member.role === 'commenter' ? 'bg-blue-50 text-blue-700' :
                    'bg-warm-50 text-warm-600'
                  }`}>
                    {member.role === 'editor' && <><Edit2 size={10} /> Edytor</>}
                    {member.role === 'commenter' && <><Eye size={10} /> Komentator</>}
                    {member.role === 'viewer' && <><Eye size={10} /> Podgląd</>}
                  </span>
                  {member.isOwner && (
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Shield size={10} /> Właściciel
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {!member.isOwner && (
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.id, e.target.value)}
                    className="text-xs border border-warm-200 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="viewer">Podgląd</option>
                    <option value="commenter">Komentarze</option>
                    <option value="editor">Edytor</option>
                  </select>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-warm-300 hover:text-red-400 transition-colors p-1"
                    title="Usuń"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Family
