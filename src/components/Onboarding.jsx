import { useState } from 'react'
import { useTasks } from '../context/TasksContext'

const STUDENT_OPTIONS = [
  { key: true, label: 'Sim, estudo', emoji: '📚' },
  { key: false, label: 'Não', emoji: '🙅' },
]

const WORK_OPTIONS = [
  { key: true, label: 'Trabalho', emoji: '💼' },
  { key: false, label: 'Não trabalho', emoji: '🏠' },
]

const LIVES_OPTIONS = [
  { key: 'alone', label: 'Moro sozinho(a)', emoji: '🏠' },
  { key: 'family', label: 'Com a família', emoji: '👨‍👩‍👧' },
  { key: 'roommates', label: 'Com amigos/colegas', emoji: '🧑‍🤝‍🧑' },
]

// Chaves de acordo com FORGET_ROTINE em onboardingService.js
const FORGET_HOME = [
  { key: 'cama', label: 'Arrumar a cama', emoji: '🛏️' },
  { key: 'roupa', label: 'Lavar / separar a roupa', emoji: '👕' },
  { key: 'louca', label: 'Lavar a louça', emoji: '🍽️' },
  { key: 'lixo', label: 'Tirar o lixo', emoji: '🗑️' },
  { key: 'mercado', label: 'Compras no mercado', emoji: '🛒' },
  { key: 'quarto', label: 'Limpar o quarto', emoji: '🧹' },
]

const FORGET_SCHOOL = [
  { key: 'dever', label: 'Conferir dever de casa', emoji: '📓' },
  { key: 'mochila', label: 'Preparar a mochila', emoji: '🎒' },
  { key: 'prazo', label: 'Prazos de trabalho', emoji: '⏰' },
  { key: 'prova', label: 'Estudar para a prova', emoji: '📝' },
]

const FORGET_WORK = [
  { key: 'compromisso', label: 'Compromissos do dia', emoji: '📅' },
  { key: 'reuniao', label: 'Reuniões do trabalho', emoji: '🤝' },
  { key: 'contas', label: 'Pagar contas / banco', emoji: '💳' },
]

const FORGET_PERSONAL = [
  { key: 'documento', label: 'Pegar o documento', emoji: '🪪' },
  { key: 'remedio', label: 'Tomar o remédio', emoji: '💊' },
  { key: 'familia', label: 'Avisar a família', emoji: '📞' },
  { key: 'dentes', label: 'Escovar os dentes', emoji: '🪥' },
  { key: 'exercicio', label: 'Praticar exercício', emoji: '🏃' },
  { key: 'acordar', label: 'Acordar na hora', emoji: '⏰' },
]

const REMINDER_OPTIONS = [
  { key: 'notification', label: 'Notificações', emoji: '🔔' },
  { key: 'email', label: 'E-mail', emoji: '📧' },
  { key: 'both', label: 'Os dois', emoji: '✨' },
]

const RECURRING_OPTIONS = [
  { key: 'morning', label: 'De manhã', emoji: '🌅' },
  { key: 'school', label: 'Durante o dia', emoji: '☀️' },
  { key: 'night', label: 'À noite', emoji: '🌙' },
]

export default function Onboarding() {
  const { finishOnboarding } = useTasks()

  const [step, setStep] = useState(0)
  const [student, setStudent] = useState(null)
  const [works, setWorks] = useState(null)
  const [lives, setLives] = useState(null)
  const [forget, setForget] = useState([])
  const [reminder, setReminder] = useState('both')
  const [recurring, setRecurring] = useState('night')
  const [saving, setSaving] = useState(false)

  // Perfil: quem nem estuda nem trabalha só vê casa e pessoal
  const isStudent = student === true
  const isWorker = works === true
  const isNeither = student === false && works === false

  const forgetSections = []
  if (isStudent || isWorker) forgetSections.push({ title: 'Casa', items: FORGET_HOME })
  else if (isNeither) forgetSections.push({ title: 'Casa', items: FORGET_HOME })
  if (isStudent) forgetSections.push({ title: 'Escola', items: FORGET_SCHOOL })
  if (isWorker) forgetSections.push({ title: 'Trabalho', items: FORGET_WORK })
  forgetSections.push({ title: 'Pessoal', items: FORGET_PERSONAL })

  const canContinue =
    (step === 0 && student !== null) ||
    (step === 1 && (isStudent || works !== null)) ||
    (step === 2 && lives !== null) ||
    step === 3 ||
    step === 4 ||
    step === 5

  const next = () => {
    if (step === 0) {
      // Se estuda, pula a pergunta do trabalho
      if (student === true) return setStep(2)
      return setStep(1)
    }
    setStep((s) => s + 1)
  }

  const goBack = () => {
    if (step === 2 && isStudent) return setStep(0)
    setStep((s) => s - 1)
  }

  const toggleForget = (key) => {
    setForget((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleFinish = () => {
    setSaving(true)
    finishOnboarding({
      student: isStudent,
      works: isWorker,
      lives,
      forget,
      reminder,
      recurring: [recurring],
    })
  }

  return (
    <div className="onboarding">
      <div className="onboarding__card">
        <div className="onboarding__logo" aria-hidden="true">🧠</div>
        <h1 className="onboarding__title">NÃO ESQUECE</h1>
        <p className="onboarding__tagline">Eu lembro por você</p>

        <div className="onboarding__progress" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={
                'onboarding__dot' +
                (i === step ? ' is-current' : '') +
                (i < step ? ' is-done' : '')
              }
            />
          ))}
        </div>

        <div className="onboarding__body">
          {step === 0 && (
            <section className="onboarding__step">
              <h2 className="onboarding__question">Você estuda?</h2>
              <p className="onboarding__hint">Para montar sua rotina de aula</p>
              <div className="onboarding__options">
                {STUDENT_OPTIONS.map((o) => (
                  <button
                    key={String(o.key)}
                    type="button"
                    className={'option-btn' + (student === o.key ? ' is-active' : '')}
                    onClick={() => setStudent(o.key)}
                  >
                    <span className="option-btn__emoji" aria-hidden="true">{o.emoji}</span>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 1 && !isStudent && (
            <section className="onboarding__step">
              <h2 className="onboarding__question">E trabalha?</h2>
              <p className="onboarding__hint">Para personalizar rotina de trabalho</p>
              <div className="onboarding__options">
                {WORK_OPTIONS.map((o) => (
                  <button
                    key={String(o.key)}
                    type="button"
                    className={'option-btn' + (works === o.key ? ' is-active' : '')}
                    onClick={() => setWorks(o.key)}
                  >
                    <span className="option-btn__emoji" aria-hidden="true">{o.emoji}</span>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="onboarding__step">
              <h2 className="onboarding__question">Com quem você mora?</h2>
              <p className="onboarding__hint">Ajuda a lembrar da casa</p>
              <div className="onboarding__options">
                {LIVES_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    className={'option-btn' + (lives === o.key ? ' is-active' : '')}
                    onClick={() => setLives(o.key)}
                  >
                    <span className="option-btn__emoji" aria-hidden="true">{o.emoji}</span>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="onboarding__step">
              <h2 className="onboarding__question">O que você mais esquece?</h2>
              <p className="onboarding__hint">Marque pelo menos um — pode marcar vários</p>
              {forgetSections.map((section) => (
                <div key={section.title} className="onboarding__section">
                  <h3 className="onboarding__section-title">{section.title}</h3>
                  <div className="onboarding__chips">
                    {section.items.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className={'chip-select' + (forget.includes(item.key) ? ' is-active' : '')}
                        onClick={() => toggleForget(item.key)}
                      >
                        <span aria-hidden="true">{item.emoji}</span> {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {step === 4 && (
            <section className="onboarding__step">
              <h2 className="onboarding__question">Como você quer lembrar?</h2>
              <p className="onboarding__hint">Na hora de avisar das tarefas</p>
              <div className="onboarding__options">
                {REMINDER_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    className={'option-btn' + (reminder === o.key ? ' is-active' : '')}
                    onClick={() => setReminder(o.key)}
                  >
                    <span className="option-btn__emoji" aria-hidden="true">{o.emoji}</span>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="onboarding__step">
              <h2 className="onboarding__question">Quando é mais fácil te achar?</h2>
              <p className="onboarding__hint">Seu melhor horário pra avisar</p>
              <div className="onboarding__options">
                {RECURRING_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    className={'option-btn' + (recurring === o.key ? ' is-active' : '')}
                    onClick={() => setRecurring(o.key)}
                  >
                    <span className="option-btn__emoji" aria-hidden="true">{o.emoji}</span>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
              <button
                className="btn btn-primary btn-block btn-lg onboarding__finish"
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? 'Preparando…' : 'Começar! 🚀'}
              </button>
            </section>
          )}
        </div>

        <div className="onboarding__nav">
          {step > 0 && (
            <button className="btn-ghost" onClick={goBack} disabled={saving}>
              ← Voltar
            </button>
          )}
          {step < 5 && (
            <button
              className="btn btn-primary"
              onClick={next}
              disabled={!canContinue}
            >
              Continuar →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
