import { useEffect, useRef, useState } from 'react'
import { useUI } from '../context/UIContext'
import { useTasks } from '../context/TasksContext'

const POMODORO = 25 * 60

export default function FocusMode() {
  const { focusTask, setFocusTask, openTaskModal, toast } = useUI()
  const { updateTask, completeTask } = useTasks()

  const [seconds, setSeconds] = useState(POMODORO)
  const [running, setRunning] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!focusTask) return
    setSeconds(POMODORO)
    setRunning(false)
  }, [focusTask])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current)
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [running])

  if (!focusTask) return null

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const handleDone = () => {
    completeTask(focusTask.id)
    setFocusTask(null)
    toast('Boa. Mais uma. 🎉')
  }

  const handleGiveUp = () => {
    updateTask(focusTask.id, { snoozeCount: (focusTask.snoozeCount || 0) + 1 })
    setFocusTask(null)
    toast('Sem problema. Quando você conseguir? 😉')
  }

  const handleNextStep = () => {
    setFocusTask(null)
    openTaskModal(focusTask)
  }

  return (
    <div className="focus">
      <div className="focus__card">
        <button className="focus__close" onClick={() => setFocusTask(null)} aria-label="Sair do modo foco">✕</button>

        <span className="chip">{focusTask.category}</span>
        <h1 className="focus__title">{focusTask.title}</h1>
        {focusTask.nextStep && (
          <p className="focus__step">🎯 {focusTask.nextStep}</p>
        )}

        {showTimer && (
          <div className="focus__timer" role="timer">{mm}:{ss}</div>
        )}

        <div className="focus__controls">
          {!showTimer && (
            <button className="btn btn-primary" onClick={() => setShowTimer(true)}>
              ⏱ Timer 25:00
            </button>
          )}
          {showTimer && (
            <button className="btn btn-primary" onClick={() => setRunning((r) => !r)}>
              {running ? 'PAUSAR' : 'INICIAR'}
            </button>
          )}
        </div>

        <div className="focus__actions">
          <button className="btn btn-success btn-lg" onClick={handleDone}>CONCLUÍ</button>
          <button className="btn-ghost" onClick={handleNextStep}>+ próximo passo</button>
          <button className="btn-text" onClick={handleGiveUp}>NÃO CONSIGO AGORA</button>
        </div>
      </div>
    </div>
  )
}
