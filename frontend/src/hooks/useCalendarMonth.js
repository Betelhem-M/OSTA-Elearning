import { useState, useMemo } from 'react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function useCalendarMonth(initialDate = new Date()) {
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))

  const cells = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const result = []
    for (let i = firstWeekday - 1; i >= 0; i--) {
      result.push({ day: daysInPrevMonth - i, outside: true })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, outside: false, dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
    while (result.length % 7 !== 0) {
      result.push({ day: result.length, outside: true })
    }
    return result
  }, [viewDate])

  return {
    viewDate,
    label: `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}`,
    cells,
    goToPrevMonth: () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)),
    goToNextMonth: () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)),
  }
}