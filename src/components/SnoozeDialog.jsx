import { useState } from 'react'
import { useTasks } from '../context/TasksContext'
import { useUI } from '../context/UIContext'
import { addDaysISO, todayISO, toISODate } from '../utils/date'
import { FORGET_RISK } from '../config/taskTypes'

const SNOOZE_OPTIONS = [
  { key: '30m', label: '30 minutos', add: null, time: null, minutes: 30 },
  { key: '1h', label: '1 hora', add: null, time: null, minutes: 60 },
  { key: 'tonight', label: 'Hoje à noite', add: 0, time: '21:00' },
  { key: 'tomorrow', label: 'Amanhã', add: 1, time: null },
]

const REASONS = [
  'É muito grande',
  'Não sei por onde começar',
  'Não estou com vontade',
  'Esqueci',
  'Não é mais importante',
]

export default function SnoozeDialog({ task, onClose }) {
  const { updateTask } = useTasks()
  const { toast, openTaskModal, closeTaskModal } = useUI()
  const [step, setStep] = useState(0)
  const [reason, setReason] = useState('')

  if (!task) return null

  const running = task.snoozeCount || 0

  const applySnooze = (opt) => {
    const dueDate = addDaysISO(opt.add ?? 0)
    updateTask(task.id, {
      dueDate,
      dueTime: opt.time || null,
      snoozeCount: running + 1,
      forgetRisk: running + 1 >= 2 ? FORGET_RISK.high : FORGET_RISK.medium,
      status: 'pending',
    })
    const wasRunning = running >= 2
    toast(wasRunning ? 'Tá. Mas eu tô de olho. 👀' : 'Sem problema. Quando você consegue? 😉')
    onClose()
  }

  const handleReason = (r) => {
    setReason(r)
    updateTask(task.id, {
      reason: r,
      forgetRisk: r === 'Não é mais importante' ? FORGET_RISK.low : FORGET_RISK.high,
    })
    if (r === 'É muito grande' || r === 'Não sei por onde começar') {
      setStep(2)
    } else if (r === 'Não é mais importante') {
      toast('Ok, tchau pra essa então. 👋')
      onClose()
    } else {
      toast('Relaxa, eu lembro. 💛')
      onClose()
    }
  }

  const handleSplit = () => {
    setStep(3)
  }

  const splitTask = () => {
    onClose()
    closeTaskModal()
    // abre o modal de edição da própria tarefa para o usuário definir próximos passos
    openTaskModal(task)
    toast('Bora dividir em passos menores 🧩')
  }

  if (step === 0) {
    return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <button className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>
          <h2 className="modal__title">Adiar 🔔</h2>
          {running >= 2 && (
            <p className="warning-box">
              👀 Você está fugindo dessa tarefa.
              <br />
              Essa tarefa já foi adiada <strong>{running} vezes</strong>.
            </p>
          )}
          <p className="page__sub" style={{ marginBottom: 12 }}>Quando você quer ser lembrado?</p>
          <div className="snooze-list">
            {SNOOZE_OPTIONS.map((opt) => (
              <button key={opt.key} className="snooze-option" onClick={() => applySnooze(opt)}>
                {opt.label}
              </button>
            ))}
          </div>
          {running >= 1 && (
            <button className="btn-text btn-block" style={{ marginTop: 10 }} onClick={() => setStep(1)}>
              …na verdade, me pergunta o que está pegando →
            </button>
          )}
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <button className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>
          <h2 className="modal__title">O que está pegando? 🤔</h2>
          <p className="page__sub" style={{ marginBottom: 12 }}>Sem julgamento. É pra entender.</p>
          <div className="snooze-list">
            {REASONS.map((r) => (
              <button key={r} className="snooze-option" onClick={() => handleReason(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <button className="modal__close" onClick={onClose} aria-label="Fechar">✕</button>
          <h2 className="modal__title">Quer dividir em passos menores? 🧩</h2>
          <p className="page__sub" style={{ marginBottom: 16 }}>
            Em vez de “fazer tudo”, você faz só o próximo passo.
          </p>
          <button className="btn btn-primary btn-block btn-lg" onClick={handleSplit}>Sim, dividir</button>
          <button className="btn-ghost btn-block" style={{ marginTop: 8 }} onClick={onClose}>
            Não, deixa pra lá
          </button>
        </div>
      </div>
    )
  }

  return null
}
