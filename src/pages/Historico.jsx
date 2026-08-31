import { useMemo } from 'react'
import { useTasks } from '../context/TasksContext'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'

export default function Historico() {
  const { tasks, loaded } = useTasks()

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').length
    const snoozed = tasks.filter((t) => t.snoozeCount > 0).length
    const forgotten = tasks.filter((t) => t.forgetRisk === 'high').length
    return { total: tasks.length, done, snoozed, forgotten }
  }, [tasks])

  const enough = stats.total >= 5

  const cards = [
    { label: 'Criadas', value: stats.total, emoji: '➕' },
    { label: 'Concluídas', value: stats.done, emoji: '✅' },
    { label: 'Adiadas', value: stats.snoozed, emoji: '😴' },
    { label: 'Com atenção', value: stats.forgotten, emoji: '⚠️' },
  ]

  return (
    <div className="page">
      <section className="page__header">
        <h1>Histórico</h1>
        <p className="page__sub">Seus números e seus padrões.</p>
      </section>

      {!loaded ? (
        <LoadingState />
      ) : stats.total === 0 ? (
        <EmptyState
          emoji="📊"
          title="Sem dados ainda."
          subtitle="Continue usando o site para descobrirmos seus padrões."
        />
      ) : (
        <>
          <div className="stat-grid">
            {cards.map((c) => (
              <div className="stat-card" key={c.label}>
                <span className="stat-card__emoji" aria-hidden="true">{c.emoji}</span>
                <strong className="stat-card__value">{c.value}</strong>
                <span className="stat-card__label">{c.label}</span>
              </div>
            ))}
          </div>

          <section className="insights">
            <h2 className="insights__title">Seus padrões</h2>
            {!enough ? (
              <p className="insights__empty">
                Continue usando o site para descobrirmos seus padrões.
              </p>
            ) : (
              <ul className="insights__list">
                {stats.snoozed >= 3 && <li>Você costuma adiar algumas tarefas. Sem julgamentos — bora retomar? 😉</li>}
                {stats.done > 0 && <li>Você já concluiu {stats.done} {stats.done === 1 ? 'tarefa' : 'tarefas'}. Seguindo bem! 🚀</li>}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
