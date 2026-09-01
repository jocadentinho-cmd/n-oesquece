import { useMemo, useState } from 'react'
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
import { FORGET_SCORE, CONTEXTS } from '../services/taskService'

const PRIORITY_RANK = { important: 3, normal: 2, calm: 1 }

const CONTEXT_LABELS = {
  casa: '🏠 Casa',
  escola: '🏫 Escola',
  trabalho: '💼 Trabalho',
  academia: '🏋 Academia',
  rua: '🚶 Rua',
  computador: '💻 Computador',
}

function defaultContext() {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'escola'
  if (h >= 12 && h < 18) return 'trabalho'
  return 'casa'
}

export default function Hoje() {
  const { tasks, events, routine, loaded } = useTasks()
  const { openTaskModal, setFocusTask, toast } = useUI()
  const today = todayISO()
  const [leaving, setLeaving] = useState('')
  const [nightDone, setNightDone] = useState({})

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
    () =>
      pending
        .map((t) => ({ t, score: FORGET_SCORE.score(t) }))
        .filter((x) => x.score >= 40)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((x) => x.t),
    [pending]
  )

  const nightRoutine = routine.night || []
  const nextDayRoutine = routine.school || []

  const leavingTasks = useMemo(() => {
    if (!leaving) return []
    return pending
      .filter((t) => t.context === leaving)
      .concat(pending.filter((t) => !t.context && t.category === leaving))
      .slice(0, 6)
  }, [pending, leaving])

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

  const handleLeave = (ctx) => {
    setLeaving(ctx)
  }

  const toggleNight = (id) => {
    setNightDone((prev) => ({ ...prev, [id]: !prev[id] }))
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
              <h2 className="today-section__title">⚠️ ANTES QUE VOCÊ ESQUEÇA</h2>
              <p className="today-section__hint">Só o que realmente precisa de atenção.</p>
              <ul className="tasklist">
                {dontForget.map((t) => (
                  <li key={t.id}><TaskCard task={t} /></li>
                ))}
              </ul>
            </section>
          )}

          <section className="today-section">
            <h2 className="today-section__title">🎒 VOU SAIR</h2>
            <p className="today-section__hint">Pra onde você vai? Eu verifico o que não pode faltar.</p>
            <div className="cell-row">
              {CONTEXTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={'cell' + (leaving === c ? ' is-active' : '')}
                  onClick={() => handleLeave(leaving === c ? '' : c)}
                >
                  {CONTEXT_LABELS[c]}
                </button>
              ))}
            </div>
            {leavingTasks.length > 0 && (
              <ul className="tasklist" style={{ marginTop: 12 }}>
                {leavingTasks.map((t) => (
                  <li key={t.id}><TaskCard task={t} /></li>
                ))}
              </ul>
            )}
          </section>

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
              <p className="today-section__hint">Vamos garantir que amanhã não vire correria?</p>
              <ul className="routine-inline">
                {nightRoutine.map((item) => {
                  const checked = nightDone[item.id]
                  return (
                    <li
                      className={'routine-item' + (checked ? ' is-done' : '')}
                      key={item.id}
                      onClick={() => toggleNight(item.id)}
                    >
                      <span className="routine-item__check">{checked ? '✓' : '☐'}</span>
                      <span>{item.label}</span>
                    </li>
                  )
                })}
              </ul>
              {nextDayRoutine.length > 0 && (
                <div className="tomorrow-preview">
                  <h3 className="tomorrow-preview__title">Amanhã</h3>
                  <ul className="routine-inline">
                    {nextDayRoutine.slice(0, 5).map((item) => (
                      <li className="routine-item" key={item.id}>
                        <span className="routine-item__check">☐</span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
