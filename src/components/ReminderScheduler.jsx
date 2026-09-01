import { useEffect, useRef } from 'react'
import { useTasks } from '../context/TasksContext'
import { reminderTime, canNotify, showNotification } from '../services/notificationService'

/**
 * Fica montado no app e, enquanto estiver aberto, dispara as notificações
 * de lembrete assim que o horário chega. Marca cada evento como avisado
 * (reminderSent) para não repetir.
 */
export default function ReminderScheduler() {
  const { events, updateEvent, loaded } = useTasks()
  const sentRef = useRef(new Set())

  useEffect(() => {
    if (!loaded) return

    const interval = setInterval(() => {
      if (!canNotify()) return
      const now = Date.now()
      events.forEach((e) => {
        if (!e.reminder || e.reminderSent) return
        if (sentRef.current.has(e.id)) return
        const t = reminderTime(e)
        if (t !== null && t <= now) {
          sentRef.current.add(e.id)
          const triggered = showNotification('⏰ NÃO ESQUECE', e.title)
          if (triggered) {
            updateEvent(e.id, { reminderSent: true })
          }
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [events, updateEvent, loaded])

  return null
}
