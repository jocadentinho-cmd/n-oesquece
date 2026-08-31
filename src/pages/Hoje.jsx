import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTasks } from '../context/TasksContext'
import { useUI } from '../context/UIContext'
import QuickAdd from '../components/QuickAdd'
import TaskCard from '../components/TaskCard'
import CategoryBadge from '../components/CategoryBadge'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { eventColor } from '../config/taskTypes'
import { greeting, todayISO, formatDue, formatEventDate } from '../utils/date'

const PRIORITY_RANK = { important: 3, normal: 2, calm: 1 }

export default function Hoje() {
  const { tasks, events, routine, loaded } = useTasks()
  const { openTaskModal, setFocusTask } = useUI()
  const today = todayISO()

  const pending = useMemo(() => tasks.filter((t) => t.status === 'pending'), [tasks])

  const todayTasks = useMemo(
    () =>
      pending
        .filter((t) => !t.dueDate || t.dueDate <= today)
        .sort((a, b) => (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)),
    [pending, today]
  )

  const laterTasks = useMemo(
    () => pending.filter((t) => t.dueDate && t.dueDate > today),
    [pending, today]
  )

  const nowTask = todayTasks[0] || null
  const moreLater = todayTasks.slice(1)

  const dontForget = useMemo(
    () => pending.filter((t) => t.forgetRisk === 'high').slice(0, 4),
    [pending]
  )

  const nightRoutine = routine.night || []

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => e.date && e.date >= today)
        .sort((a, b) => {
          if (a.date === b.date) return (a.time || '').localeCompare(b.time || '')
          return a.date.localeCompare(b.date)
        })
        .slice(0, 5),
    [events, today]
  )

  const handleStart = () => {
    if (nowTask) setFocusTask(nowTask)
  }

  return (
    <div className="page">
      <header className="home-header">
        <h1 className="home-header__greeting">{greeting()} 👋</h1>
        <p className="page__sub">Você não precisa lembrar de tudo. Eu lembro por você.</p>
      </header>

      <div className="home-quickadd">
        <label className="field-label" htmlFor="quick">O que você precisa lembrar?</label>
        <QuickAdd />
      </div>

      {!loaded ? (
        <LoadingState />
      ) : (
        <>
          {dontForget.length > 0 && (
            <section className="today-section today-section--warn">
              <h2 className="today-section__title">⚠️ NÃO ESQUECER</h2>
              <ul className="tasklist">
                {dontForget.map((t) => (
                  <li key={t.id}><TaskCard task={t} /></li>
                ))}
              </ul>
            </section>
          )}

          {pending.length === 0 ? (
            <EmptyState
              emoji="🎉"
              title="Nada pendente por aqui."
              subtitle="Relaxa, eu lembro. Quando algo surgir, é só anotar."
              actionLabel="Nova tarefa"
              onAction={() => openTaskModal()}
            />
          ) : (
            <>
              {nowTask && (
                <section className="today-section">
                  <h2 className="today-section__title">🔴 AGORA</h2>
                  <div className="now-card">
                    <div className="now-card__meta">
                      {nowTask.category && <CategoryBadge category={nowTask.category} />}
                      {nowTask.dueDate && (
                        <span className="now-card__due">🗓 {formatDue(nowTask.dueDate, nowTask.dueTime)}</span>
                      )}
                    </div>
                    <h3 className="now-card__title">{nowTask.title}</h3>
                    {nowTask.nextStep && (
                      <p className="now-card__next">🎯 {nowTask.nextStep}</p>
                    )}
                    <button className="btn btn-primary btn-block" onClick={handleStart}>
                      COMEÇAR
                    </button>
                  </div>
                </section>
              )}

              {moreLater.length > 0 && (
                <section className="today-section">
                  <h2 className="today-section__title">📌 MAIS TARDE</h2>
                  <ul className="tasklist">
                    {moreLater.map((t) => (
                      <li key={t.id}><TaskCard task={t} /></li>
                    ))}
                  </ul>
                </section>
              )}

              {laterTasks.length > 0 && (
                <section className="today-section">
                  <h2 className="today-section__title">🗓 PRÓXIMOS DIAS</h2>
                  <ul className="tasklist">
                    {laterTasks.map((t) => (
                      <li key={t.id}><TaskCard task={t} /></li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          {nightRoutine.length > 0 && (
            <section className="today-section">
              <h2 className="today-section__title">🌙 ANTES DE DORMIR</h2>
              <ul className="routine-inline">
                {nightRoutine.map((item) => (
                  <li className="routine-item" key={item.id}>
                    <span className="routine-item__check">☐</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {upcomingEvents.length > 0 && (
            <section className="today-section">
              <h2 className="today-section__title">🕒 PRÓXIMOS EVENTOS</h2>
              <ol className="timeline">
                {upcomingEvents.map((e) => (
                  <li className="timeline__item" key={e.id}>
                    <span
                      className="timeline__dot"
                      style={{ background: eventColor(e.color).hex }}
                    />
                    <div className="timeline__content">
                      <span className="timeline__date">{formatEventDate(e.date, e.time)}</span>
                      <strong className="timeline__title">{e.title}</strong>
                      {e.location && <span className="timeline__meta">📍 {e.location}</span>}
                    </div>
                  </li>
                ))}
              </ol>
              <Link to="/calendario" className="cal-today" style={{ marginTop: 4 }}>
                Ver calendário completo →
              </Link>
            </section>
          )}
        </>
      )}
    </div>
  )
}
