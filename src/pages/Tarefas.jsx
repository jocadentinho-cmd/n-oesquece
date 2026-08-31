import { useMemo, useState } from 'react'
import { useTasks } from '../context/TasksContext'
import { useUI } from '../context/UIContext'
import TaskCard from '../components/TaskCard'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'done', label: 'Concluídas' },
]

export default function Tarefas() {
  const { tasks, loaded } = useTasks()
  const { openTaskModal } = useUI()
  const [filter, setFilter] = useState('all')

  const list = useMemo(() => {
    if (filter === 'all') return tasks
    return tasks.filter((t) => t.status === filter)
  }, [tasks, filter])

  return (
    <div className="page">
      <section className="page__header">
        <h1>Tarefas</h1>
        <p className="page__sub">Tudo o que você precisa se lembrar, num só lugar.</p>
      </section>

      <div className="segmented" role="tablist" aria-label="Filtrar tarefas">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className={'segmented__btn' + (filter === f.key ? ' is-active' : '')}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!loaded ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <EmptyState
          emoji="🎉"
          title="Nada pendente por aqui."
          subtitle={filter === 'done' ? 'Você ainda não concluiu nenhuma tarefa.' : 'Crie sua primeira tarefa em poucos segundos.'}
          actionLabel="Nova tarefa"
          onAction={() => openTaskModal()}
        />
      ) : (
        <ul className="tasklist">
          {list.map((t) => (
            <li key={t.id}>
              <TaskCard task={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
