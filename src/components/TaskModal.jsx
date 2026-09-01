import { useEffect, useRef, useState } from 'react'
import { useUI } from '../context/UIContext'
import { useTasks } from '../context/TasksContext'
import { CATEGORIES, PRIORITIES, RECURRENCE } from '../config/taskTypes'
import { CONTEXTS } from '../services/taskService'
import { addDaysISO, todayISO} from '../utils/date'

const WHEN = [
  { key: 'today', label: 'Hoje' },
  { key: 'tomorrow', label: 'Amanhã' },
  { key: 'week', label: 'Esta semana' },
  { key: 'date', label: 'Escolher data' },
]

const CONTEXT_LABELS = {
  casa: '🏠 Casa',
  escola: '🏫 Escola',
  trabalho: '💼 Trabalho',
  academia: '🏋 Academia',
  rua: '🚶 Rua',
  computador: '💻 Computador',
}

export default function TaskModal() {
  const { modalOpen, modalTask, closeTaskModal, toast } = useUI()
  const { addTask, updateTask } = useTasks()

  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('today')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [category, setCategory] = useState('pessoal')
  const [priority, setPriority] = useState('normal')
  const [nextStep, setNextStep] = useState('')
  const [recurrence, setRecurrence] = useState('none')
  const [context, setContext] = useState('')

  const titleRef = useRef(null)

  useEffect(() => {
    if (modalOpen) {
      if (modalTask) {
        setTitle(modalTask.title)
        setDate(modalTask.dueDate || '')
        setTime(modalTask.dueTime || '')
        setCategory(modalTask.category || 'pessoal')
        setPriority(modalTask.priority || 'normal')
        setNextStep(modalTask.nextStep || '')
        setRecurrence(modalTask.recurrence || 'none')
        setContext(modalTask.context || '')
        setWhen(modalTask.dueDate ? 'date' : 'today')
      } else {
        setTitle('')
        setWhen('today')
        setDate('')
        setTime('')
        setCategory('pessoal')
        setPriority('normal')
        setNextStep('')
        setRecurrence('none')
        setContext('')
      }
      setTimeout(() => titleRef.current && titleRef.current.focus(), 60)
    }
  }, [modalOpen, modalTask])

  if (!modalOpen) return null

  const resolveDueDate = () => {
    if (when === 'today') return todayISO()
    if (when === 'tomorrow') return addDaysISO(1)
    if (when === 'week') return addDaysISO(7)
    return date || null
  }

  const handleSave = (e) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) {
      toast('Escreve o que você precisa fazer 💭', 'warning')
      return
    }
    const dueDate = resolveDueDate()
    if (modalTask) {
      updateTask(modalTask.id, {
        title: t,
        dueDate,
        dueTime: time || null,
        category,
        priority,
        nextStep: nextStep.trim() || null,
        recurrence,
        context: context || null,
      })
      toast('Atualizado!')
    } else {
      addTask({
        title: t,
        dueDate,
        dueTime: time || null,
        category,
        priority,
        nextStep: nextStep.trim() || null,
        recurrence,
        context: context || null,
        originalInput: '',
      })
      toast('Tá salvo. 💾')
    }
    closeTaskModal()
  }

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) closeTaskModal()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Nova tarefa">
        <div className="modal__handle" />
        <button className="modal__close" onClick={closeTaskModal} aria-label="Fechar">✕</button>

        <h2 className="modal__title">{modalTask ? 'Editar tarefa' : 'O que você precisa fazer?'}</h2>

        <form onSubmit={handleSave}>
          <input
            ref={titleRef}
            className="modal__input"
            type="text"
            value={title}
            placeholder="Ex: entregar trabalho de física"
            aria-label="Título da tarefa"
            onChange={(e) => setTitle(e.target.value)}
          />

          <fieldset className="form-field">
            <legend className="field-label">Quando?</legend>
            <div className="cell-row">
              {WHEN.map((w) => (
                <button
                  key={w.key}
                  type="button"
                  className={'cell' + (when === w.key ? ' is-active' : '')}
                  onClick={() => setWhen(w.key)}
                >
                  {w.label}
                </button>
              ))}
            </div>
            {when === 'date' && (
              <div className="modal__date-row">
                <input type="date" className="modal__input" value={date} aria-label="Data" onChange={(e) => setDate(e.target.value)} />
              </div>
            )}
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">Horário (opcional)</legend>
            <input type="time" className="modal__input" value={time} aria-label="Horário" onChange={(e) => setTime(e.target.value)} />
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">Categoria</legend>
            <div className="grid-2">
              {Object.entries(CATEGORIES).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  className={'cell cell--big' + (category === key ? ' is-active' : '')}
                  onClick={() => setCategory(key)}
                >
                  <span aria-hidden="true">{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">Prioridade</legend>
            <div className="cell-row">
              {Object.entries(PRIORITIES).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  className={'cell' + (priority === key ? ' is-active' : '')}
                  onClick={() => setPriority(key)}
                >
                  <span aria-hidden="true">{p.emoji}</span> {p.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">🎯 Próximo passo (opcional)</legend>
            <input
              className="modal__input"
              type="text"
              value={nextStep}
              placeholder="Ex: abrir o documento"
              aria-label="Próximo passo"
              onChange={(e) => setNextStep(e.target.value)}
            />
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">📍 Onde (opcional)</legend>
            <div className="cell-row">
              {CONTEXTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={'cell' + (context === c ? ' is-active' : '')}
                  onClick={() => setContext(context === c ? '' : c)}
                >
                  {CONTEXT_LABELS[c]}
                </button>
              ))}
            </div>
            {context && (
              <p className="field-hint">Pra eu te lembrar na hora de sair. 🎒</p>
            )}
          </fieldset>

          <fieldset className="form-field">
            <legend className="field-label">Repetir</legend>
            <div className="cell-row">
              {Object.entries(RECURRENCE).map(([key, r]) => (
                <button
                  key={key}
                  type="button"
                  className={'cell' + (recurrence === key ? ' is-active' : '')}
                  onClick={() => setRecurrence(key)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="btn btn-primary btn-block btn-lg" type="submit">SALVAR</button>
        </form>
      </div>
    </div>
  )
}
