import { useEffect, useRef, useState } from 'react'
import { useUI } from '../context/UIContext'
import { useTasks } from '../context/TasksContext'
import { EVENT_COLORS } from '../config/taskTypes'
import { REMINDER_OPTIONS, requestPermission, canNotify } from '../services/notificationService'

export default function EventModal() {
  const { eventModalOpen, eventModalDate, eventModalEvent, closeEventModal, toast } = useUI()
  const { addEvent, updateEvent, deleteEvent } = useTasks()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('primary')
  const [reminder, setReminder] = useState('')

  const titleRef = useRef(null)

  useEffect(() => {
    if (eventModalOpen) {
      if (eventModalEvent) {
        setTitle(eventModalEvent.title)
        setDate(eventModalEvent.date || '')
        setTime(eventModalEvent.time || '')
        setAllDay(eventModalEvent.allDay !== false)
        setLocation(eventModalEvent.location || '')
        setDescription(eventModalEvent.description || '')
        setColor(eventModalEvent.color || 'primary')
        setReminder(eventModalEvent.reminder || '')
      } else {
        setTitle('')
        setDate(eventModalDate || '')
        setTime('')
        setAllDay(true)
        setLocation('')
        setDescription('')
        setColor('primary')
        setReminder('')
      }
      setTimeout(() => titleRef.current && titleRef.current.focus(), 60)
    }
  }, [eventModalOpen, eventModalDate, eventModalEvent])

  if (!eventModalOpen) return null

  const isEditing = Boolean(eventModalEvent)

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) closeEventModal()
  }

  const handleSave = (e) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) {
      toast('Escreve o que é esse evento 📅', 'warning')
      return
    }
    if (!date) {
      toast('Escolhe o dia primeiro 📆', 'warning')
      return
    }
    const payload = {
      title: t,
      date,
      time: allDay ? null : (time || null),
      allDay,
      location: location.trim() || null,
      description: description.trim() || null,
      color,
      reminder: reminder || null,
    }
    if (isEditing) {
      const patch = { ...payload }
      if (eventModalEvent.reminder !== reminder) patch.reminderSent = false
      updateEvent(eventModalEvent.id, patch)
      toast('Evento atualizado! ✏️')
    } else {
      addEvent(payload)
      toast(reminder && canNotify() ? 'Evento salvo! Vou te avisar. ⏰' : 'Evento salvo! 📅')
    }
    closeEventModal()
  }

  const handleReminderChange = async (key) => {
    if (!key) {
      setReminder('')
      return
    }
    if (!('Notification' in window)) {
      toast('Seu navegador não suporta notificações.', 'warning')
      return
    }
    const perm = Notification.permission
    if (perm === 'default') {
      const result = await requestPermission()
      if (result !== 'granted') {
        toast('Sem problema. Ative depois nas Configurações.', 'warning')
        setReminder('')
        return
      }
      toast('Lembretes liberados! ⏰')
    } else if (perm !== 'granted') {
      toast('Permissão de notificação está bloqueada nas Configurações.', 'warning')
      setReminder('')
      return
    }
    setReminder(key)
  }

  const handleDelete = () => {
    if (isEditing) {
      deleteEvent(eventModalEvent.id)
      toast('Evento excluído.', 'warning')
    }
    closeEventModal()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={isEditing ? 'Editar evento' : 'Novo evento'}>
        <button className="modal__close" onClick={closeEventModal} aria-label="Fechar">✕</button>
        <h2 className="modal__title">{isEditing ? 'Editar evento ✏️' : 'Novo evento 📅'}</h2>

        <form onSubmit={handleSave}>
          <input
            ref={titleRef}
            className="modal__input"
            type="text"
            value={title}
            placeholder="Ex: Consulta no dentista"
            aria-label="Título do evento"
            onChange={(e) => setTitle(e.target.value)}
          />

          <fieldset className="form-field">
            <legend className="field-label">Dia</legend>
            <input
              type="date"
              className="modal__input"
              value={date}
              aria-label="Data do evento"
              onChange={(e) => setDate(e.target.value)}
            />
          </fieldset>

          <div className="setting-row" style={{ marginBottom: 18 }}>
            <div>
              <strong>Dia inteiro</strong>
              <p>Sem horário específico.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={allDay}
              aria-label="Evento de dia inteiro"
              className={'switch' + (allDay ? ' is-on' : '')}
              onClick={() => setAllDay((v) => !v)}
            >
              <span className="switch__thumb" />
            </button>
          </div>

          {!allDay && (
            <fieldset className="form-field">
              <legend className="field-label">Horário</legend>
              <input
                type="time"
                className="modal__input"
                value={time}
                aria-label="Horário do evento"
                onChange={(e) => setTime(e.target.value)}
              />
            </fieldset>
          )}

          <fieldset className="form-field">
            <legend className="field-label">Local (opcional)</legend>
            <input
              className="modal__input"
              type="text"
              value={location}
              placeholder="Ex: Clínica, escola…"
              aria-label="Local do evento"
              onChange={(e) => setLocation(e.target.value)}
            />
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">Cor</legend>
            <div className="event-colors">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={'event-color' + (color === c.key ? ' is-active' : '')}
                  style={{ background: c.hex }}
                  aria-label={c.label}
                  onClick={() => setColor(c.key)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">🔔 Lembrete (notificação)</legend>
            <div className="cell-row reminder-row">
              <button
                type="button"
                className={'cell' + (reminder === '' ? ' is-active' : '')}
                onClick={() => setReminder('')}
              >
                Sem lembrete
              </button>
              {REMINDER_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={'cell' + (reminder === o.key ? ' is-active' : '')}
                  onClick={() => handleReminderChange(o.key)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {reminder && !canNotify() && (
              <p className="field-hint" style={{ color: 'var(--warning)' }}>
                As notificações estão desativadas. Ative no navegador ou nas Configurações.
              </p>
            )}
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">Anotações (opcional)</legend>
            <textarea
              className="modal__input modal__textarea"
              rows="3"
              value={description}
              placeholder="Detalhes, o que levar, quem ver…"
              aria-label="Anotações do evento"
              onChange={(e) => setDescription(e.target.value)}
            />
          </fieldset>

          <button className="btn btn-primary btn-block btn-lg" type="submit">
            {isEditing ? 'SALVAR ALTERAÇÕES' : 'SALVAR EVENTO'}
          </button>

          {isEditing && (
            <button type="button" className="btn-text btn-block" style={{ marginTop: 8 }} onClick={handleDelete}>
              🗑 Excluir evento
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
