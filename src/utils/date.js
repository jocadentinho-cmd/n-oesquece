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

const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export const DATE_GRID_COLUMNS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

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

// ---------- Calendário ----------
export function monthName(monthIndex) {
  return MONTHS[monthIndex] || ''
}

export function monthNameShort(monthIndex) {
  return monthName(monthIndex).slice(0, 3)
}

export function weekdayShort(dayIndex) {
  return WEEKDAYS_SHORT[dayIndex] || ''
}

/**
 * Gera a grade de um mês (6x7 ou menos). Retorna um array de
 * objetos { iso, day, inMonth } cobrindo o grid a partir do domingo.
 * includeAdjacent: inclui dias do mês anterior/seguinte pra preencher.
 */
export function buildMonthGrid(year, monthIndex) {
  const first = new Date(year, monthIndex, 1)
  const startWeekday = first.getDay() // 0 = domingo
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(year, monthIndex, 1 - (startWeekday - i))
    cells.push({ iso: toISODate(d), day: d.getDate(), inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: toISODate(new Date(year, monthIndex, day)), day, inMonth: true })
  }
  const total = cells.length
  const remainder = total % 7
  if (remainder !== 0) {
    const extra = 7 - remainder
    for (let i = 1; i <= extra; i++) {
      const d = new Date(year, monthIndex, daysInMonth + i)
      cells.push({ iso: toISODate(d), day: d.getDate(), inMonth: false })
    }
  }
  return cells
}

/**
 * Formata uma data ISO para a timeline, ex.: "Hoje · 15:00" ou "Ter, 12 mar".
 */
export function formatEventDate(iso, time) {
  const today = todayISO()
  const tomorrow = addDaysISO(1)
  const d = parseISODate(iso)
  let label
  if (iso === today) label = 'Hoje'
  else if (iso === tomorrow) label = 'Amanhã'
  else label = `${capitalize(weekdayName(iso))}, ${d.getDate()} ${monthNameShort(d.getMonth())}`
  if (time) label += ` · ${time}`
  return label
}

export function fullDateLabel(iso) {
  const d = parseISODate(iso)
  if (!d) return ''
  return `${capitalize(weekdayName(iso))}, ${d.getDate()} de ${monthName(d.getMonth())}`
}
