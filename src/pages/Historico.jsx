import { useMemo } from 'react'
import { useTasks } from '../context/TasksContext'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { CATEGORIES } from '../config/taskTypes'
import { FORGET_SCORE } from '../services/taskService'

export default function Historico() {
  const { tasks, loaded } = useTasks()

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done')
    const snoozed = tasks.filter((t) => t.snoozeCount > 0)
    const forgotten = tasks.filter((t) => t.forgetRisk === 'high')
    const highRisk = tasks.filter((t) => t.status === 'pending' && FORGET_SCORE.score(t) >= 60)
    return {
      total: tasks.length,
      doneCount: done.length,
      snoozedCount: snoozed.length,
      forgottenCount: forgotten.length,
      highRiskCount: highRisk.length,
      done,
      snoozed,
    }
  }, [tasks])

  const enough = stats.total >= 5

  const cards = [
    { label: 'Criadas', value: stats.total, emoji: '➕' },
    { label: 'Concluídas', value: stats.doneCount, emoji: '✅' },
    { label: 'Adiadas', value: stats.snoozedCount, emoji: '😴' },
    { label: 'Com atenção', value: stats.forgottenCount, emoji: '⚠️' },
  ]

  const topAdiada = useMemo(() => {
    if (stats.snoozed.length === 0) return null
    const byCat = {}
    stats.snoozed.forEach((t) => {
      const c = t.category || 'pessoal'
      byCat[c] = (byCat[c] || 0) + t.snoozeCount
    })
    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1])
    return entries[0]
  }, [stats.snoozed])

  const semHorario = useMemo(() => {
    if (stats.total === 0) return 0
    const noTime = tasks.filter((t) => t.status === 'pending' && !t.dueTime).length
    return noTime
  }, [tasks])

  const moreAdiadasQueMedia = enough && topAdiada && topAdiada[1] >= 3

  return (
    <div className="page">
      <section className="page__header">
        <h1>Seu jeito de funcionar</h1>
        <p className="page__sub">Uma análise simples do seu uso. Sem julgamentos. 💛</p>
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

          {stats.highRiskCount > 0 && (
            <div className="warning-box">
              🔴 {stats.highRiskCount} {stats.highRiskCount === 1 ? 'tarefa precisa' : 'tarefas precisam'} de atenção — melhor não depender da memória. Dá pra dividir ou agendar.
            </div>
          )}

          <section className="insights">
            <h2 className="insights__title">Seus padrões</h2>
            {!enough ? (
              <p className="insights__empty">
                Continue usando o site para descobrirmos seus padrões.
              </p>
            ) : (
              <ul className="insights__list">
                {stats.doneCount > 0 && <li>Você já concluiu {stats.doneCount} {stats.doneCount === 1 ? 'tarefa' : 'tarefas'}. Seguindo bem! 🚀</li>}
                {stats.snoozedCount > 0 && <li>Você adiou {stats.snoozedCount} {stats.snoozedCount === 1 ? 'tarefa' : 'tarefas'}. Sem problema — bora ver como dar uma mão. 😉</li>}
                {topAdiada && <li>Você costuma adiar mais: <strong>{(CATEGORIES[topAdiada[0]] || {}).label || topAdiada[0]}</strong>. Talvez valha dividir em passos menores.</li>}
                {moreAdiadasQueMedia && <li>Algumas tarefas você já adiou várias vezes. Que tal mudar o horário ou fazer só 5 minutos?</li>}
                {semHorario >= 3 && <li>Você costuma deixar {semHorario} tarefas sem horário. Marcar um horário ajuda a não esquecer. 🕐</li>}
                {stats.highRiskCount === 0 && stats.snoozedCount === 0 && <li>Está indo bem! Pouco risco de esquecimento. 🟢</li>}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
