/**
 * notificationService — abstração sobre a Web Notification API.
 *
 * >>> PONTO DE INTEGRAÇÃO FUTURA <<<
 * Hoje as notificações só disparam enquanto o app está aberto (agendamento
 * por polling). Para notificar com o app fechado seria preciso um backend
 * com Service Worker + Push (ex.: VAPID). NUNCA finja que enviou uma
 * notificação que não foi realmente enviada.
 */

export const REMINDER_OPTIONS = [
  { key: '30m', label: '30 minutos antes', ms: 30 * 60 * 1000 },
  { key: '1h', label: '1 hora antes', ms: 60 * 60 * 1000 },
  { key: '2d', label: '2 dias antes', ms: 2 * 24 * 60 * 60 * 1000 },
  { key: '1w', label: '1 semana antes', ms: 7 * 24 * 60 * 60 * 1000 },
]

export function reminderOption(key) {
  return REMINDER_OPTIONS.find((o) => o.key === key) || null
}

export function supported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getPermission() {
  if (!supported()) return 'unsupported'
  return Notification.permission
}

export async function requestPermission() {
  if (!supported()) return 'unsupported'
  return await Notification.requestPermission()
}

export function canNotify() {
  return supported() && Notification.permission === 'granted'
}

/**
 * Momento do evento. Se tiver hora, usa data+hora. Se for dia inteiro,
 * usa o fim do dia (23:59) como limite de aviso útil.
 */
export function eventMoment(date, time, allDay) {
  const d = new Date(date + 'T00:00:00')
  if (!allDay && time) {
    const [h, m] = time.split(':').map(Number)
    d.setHours(h, m, 0, 0)
  } else {
    d.setHours(23, 59, 0, 0)
  }
  return d.getTime()
}

/**
 * Quando disparar o lembrete de um evento. Retorna timestamp (ms)
 * ou null se não houver lembrete configurado.
 */
export function reminderTime(event) {
  if (!event || !event.reminder || !event.date) return null
  const offset = reminderOption(event.reminder)
  if (!offset) return null
  return eventMoment(event.date, event.time, event.allDay) - offset.ms
}

export function showNotification(title, body = '') {
  if (!canNotify()) return false
  try {
    new Notification(title, { body, icon: '/favicon.svg' })
    return true
  } catch {
    return false
  }
}

export function formatReminderLabel(key) {
  const o = reminderOption(key)
  return o ? o.label : ''
}
