import { useState } from 'react'
import { useUI } from '../context/UIContext'
import { interpret } from '../services/parser'
import { useTasks } from '../context/TasksContext'

export default function QuickAdd() {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState(null)
  const { addTask, toast } = useTasks()
  const { toast: notify } = useUI()

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    const parsed = interpret(trimmed)
    if (parsed) {
      setPreview(parsed)
    } else {
      addTask({ title: trimmed, originalInput: trimmed })
      toast('Tá salvo. 💾')
      notify('Tarefa criada.')
    }
    setText('')
  }

  const confirmPreview = () => {
    if (!preview) return
    addTask({
      title: preview.title,
      category: preview.category,
      priority: preview.priority,
      dueDate: preview.dueDate,
      originalInput: preview.originalInput,
    })
    setPreview(null)
    toast('Tá salvo. 💾')
    notify('Tarefa criada.')
  }

  const cancelPreview = () => setPreview(null)

  if (preview) {
    return (
      <div className="confirm-preview">
        <p className="confirm-preview__hint">Interpretamos assim, tá certo?</p>
        <div className="confirm-preview__card">
          <strong>{preview.title}</strong>
          <div className="confirm-preview__tags">
            {preview.category && <span className="chip">📚 {preview.category}</span>}
            {preview.priority && <span className="chip">🔴 {preview.priority}</span>}
            {preview.dueDate && <span className="chip">🗓 {preview.dayLabel || preview.dueDate}</span>}
            {preview.dueTime && <span className="chip">🕐 {preview.dueTime}</span>}
          </div>
          <p className="confirm-preview__original">“{preview.originalInput}”</p>
        </div>
        <div className="confirm-preview__actions">
          <button className="btn btn-primary" onClick={confirmPreview}>Salvar ✓</button>
          <button className="btn-ghost" onClick={cancelPreview}>Ajustar</button>
        </div>
      </div>
    )
  }

  return (
    <form className="quickadd" onSubmit={handleSubmit}>
      <span className="quickadd__plus" aria-hidden="true">＋</span>
      <input
        className="quickadd__input"
        type="text"
        value={text}
        placeholder="Ex: sexta tenho que entregar trabalho de física"
        aria-label="O que você precisa lembrar?"
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-primary quickadd__btn" type="submit">Adicionar</button>
    </form>
  )
}
