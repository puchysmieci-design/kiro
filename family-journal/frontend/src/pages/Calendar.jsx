import { useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/pl'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

dayjs.locale('pl')

function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [entries, setEntries] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [currentMonth])

  const fetchEntries = async () => {
    try {
      const res = await axios.get('/api/entries', {
        params: {
          month: currentMonth.month() + 1,
          year: currentMonth.year()
        }
      })
      setEntries(res.data)
    } catch (err) {
      console.error('Błąd ładowania:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const start = currentMonth.startOf('month')
    const end = currentMonth.endOf('month')
    const days = []
    
    // Padding for first day of week
    const firstDayOfWeek = start.day() || 7 // Monday = 1
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let d = 1; d <= end.date(); d++) {
      days.push(d)
    }
    return days
  }

  const getEntriesForDay = (day) => {
    const dateStr = currentMonth.date(day).format('YYYY-MM-DD')
    return entries.filter(e => e.date === dateStr)
  }

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'))
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'))

  const days = getDaysInMonth()
  const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']

  const dayEntries = selectedDay ? getEntriesForDay(selectedDay) : []

  return (
    <div className="sm:ml-56">
      <h2 className="font-display font-bold text-2xl text-warm-900 mb-6">Kalendarz</h2>

      <div className="card">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-warm-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-warm-600" />
          </button>
          <h3 className="font-display font-semibold text-lg text-warm-800 capitalize">
            {currentMonth.format('MMMM YYYY')}
          </h3>
          <button onClick={nextMonth} className="p-2 hover:bg-warm-100 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-warm-600" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-warm-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>
            }

            const dayHasEntries = getEntriesForDay(day).length > 0
            const isToday = dayjs().isSame(currentMonth.date(day), 'day')
            const isSelected = selectedDay === day

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all text-sm ${
                  isSelected
                    ? 'bg-primary-500 text-white'
                    : isToday
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'hover:bg-warm-50 text-warm-700'
                }`}
              >
                {day}
                {dayHasEntries && !isSelected && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Entries */}
      {selectedDay && (
        <div className="mt-4">
          <h4 className="font-medium text-warm-700 mb-3">
            {currentMonth.date(selectedDay).format('D MMMM YYYY')}
          </h4>
          {dayEntries.length === 0 ? (
            <p className="text-warm-400 text-sm italic">Brak wpisów tego dnia</p>
          ) : (
            <div className="space-y-3">
              {dayEntries.map(entry => (
                <div key={entry.id} className="card flex items-center gap-4">
                  {entry.imageUrl && (
                    <img
                      src={entry.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-warm-800">{entry.title || entry.description}</p>
                    <div className="flex items-center gap-2 text-sm text-warm-400">
                      <span>{entry.profileEmoji}</span>
                      <span>{entry.profileName}</span>
                    </div>
                  </div>
                  {entry.milestone && (
                    <Star size={16} className="text-primary-400" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Calendar
