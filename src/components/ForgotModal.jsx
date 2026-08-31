import { useEffect, useRef, useState } from 'react'
import { useUI } from '../context/UIContext'
import { useTasks } from '../context/TasksContext'
import { interpret } from '../services/parser'
import { addDaysISO } from '../utils/date'

export default function ForgotModal() {
  const { forgotOpen, closeForgot, toast } = useUI()
  const { addTask } = useTasks()
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (forgotOpen) {
      setText('')
      setTimeout(() => inputRef.current && inputRef.current.focus(), 60)
    }
  }, [forgotOpen])

  if (!forgotOpen) return null

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) closeForgot()
  }

  const handleSave = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) {
      toast('Conta aí, o que você lembrou? 🧠', 'warning')
      return
    }
    const parsed = interpret(t)
    addTask({
      title: parsed ? parsed.title : t,
      category: parsed && parsed.category ? parsed.category : 'pessoal',
      priority: parsed && parsed.priority ? parsed.priority : 'important',
      dueDate: parsed && parsed.dueDate ? parsed.dueDate : addDaysISO(1),
      originalInput: t,
      forgetRisk: 'high',
    })
    closeForgot()
    toast('Antes que você esqueça. Tá salvo! ✅')
  }

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Esqueci alguma coisa">
        <button className="modal__close" onClick={closeForgot} aria-label="Fechar">✕</button>
        <h2 className="modal__title">😭 Esqueci alguma coisa</h2>
        <p className="page__sub">O que você acabou de lembrar?</p>
        <form onSubmit={handleSave}>
          <input
            ref={inputRef}
            className="modal__input"
            type="text"
            value={text}
            placeholder="Ex: tenho prova de matemática quinta"
            aria-label="O que você lembrou"
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-primary btn-block btn-lg" type="submit">Salvar antes que esqueça</button>
        </form>
      </div>
    </div>
  )
}
