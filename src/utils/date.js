const WEEKDAYS = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
]

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export function todayISO() {
  const d = new Date()
  return toISODate(d)
}

export function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDaysISO(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function parseISODate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function weekdayOfISO(iso) {
  const d = parseISODate(iso)
  return d ? WEEKDAYS[d.getDay()] : ''
}

export function weekdayName(iso) {
  const d = parseISODate(iso)
  return d ? WEEKDAYS[d.getDay()] : ''
}

export function isSameDay(isoA, isoB) {
  return isoA === isoB
}

export function greeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Bom dia'
  if (h >= 12 && h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function formatDue(iso, time) {
  const today = todayISO()
  const tomorrow = addDaysISO(1)
  let dayLabel
  if (iso === today) dayLabel = 'Hoje'
  else if (iso === tomorrow) dayLabel = 'Amanhã'
  else {
    const isThisWeek = parseISODate(iso) && parseISODate(iso) - parseISODate(today) < 7 * 86400000 && parseISODate(iso) >= parseISODate(today)
    dayLabel = isThisWeek ? capitalize(weekdayName(iso)) : formatShortDate(iso)
  }
  if (time) dayLabel += ` • ${time}`
  return dayLabel
}

export function formatShortDate(iso) {
  const d = parseISODate(iso)
  if (!d) return ''
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function formatTimeFromDate(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function relativeDay(iso) {
  const today = todayISO()
  const tomorrow = addDaysISO(1)
  if (iso === today) return 'hoje'
  if (iso === tomorrow) return 'amanhã'
  return weekdayName(iso)
}
