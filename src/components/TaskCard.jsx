import { useState } from 'react'
import { useTasks } from '../context/TasksContext'
import { useUI } from '../context/UIContext'
import PriorityBadge from './PriorityBadge'
import CategoryBadge from './CategoryBadge'
import SnoozeDialog from './SnoozeDialog'
import { formatDue } from '../utils/date'
import { FORGET_SCORE } from '../services/taskService'

export default function TaskCard({ task }) {
  const { completeTask, deleteTask, reuseTask, bumpTask, updateTask } = useTasks()
  const { openTaskModal, toast, setFocusTask } = useUI()
  const [snoozing, setSnoozing] = useState(false)

  const isDone = task.status === 'done'
  const overdue =
    !isDone &&
    task.dueDate &&
    task.dueDate < new Date().toISOString().slice(0, 10)

  const forget = FORGET_SCORE.score(task)
  const risk = FORGET_SCORE.label(forget)

  const handleComplete = () => {
    if (isDone) {
      reuseTask(task.id)
      toast('Voltou para a lista.')
    } else {
      completeTask(task.id)
      toast('Boa. Mais uma. 🎉')
    }
  }

  const handleEdit = () => openTaskModal(task)

  const handleDelete = (e) => {
    e.stopPropagation()
    deleteTask(task.id)
    toast('Tarefa excluída.', 'warning')
  }

  const handleRemind = (e) => {
    e.stopPropagation()
    bumpTask(task.id)
    toast('Tá. Vou lembrar você. 🔔')
  }

  const handleQuick5 = (e) => {
    e.stopPropagation()
    updateTask(task.id, { quick5: true })
    setFocusTask({ ...task, quick5: true })
  }

  return (
    <article className={'task-card' + (isDone ? ' is-done' : '') + (overdue ? ' is-overdue' : '')}>
      <button
        className="task-card__check"
        onClick={handleComplete}
        aria-label={isDone ? 'Reabrir tarefa' : 'Concluir tarefa'}
        aria-pressed={isDone}
      >
        {isDone ? <span aria-hidden="true">✓</span> : <span aria-hidden="true" />}
      </button>

      <div className="task-card__body" role="button" tabIndex={0} onClick={handleEdit} onKeyDown={(e) => e.key === 'Enter' && handleEdit()}>
        <div className="task-card__top">
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
          {!isDone && (task.forgetRisk === 'high' || forget >= 60) ? (
            <span className="risk-pill" title={risk.text}>{risk.emoji}</span>
          ) : null}
        </div>
        <h3 className="task-card__title">{task.title}</h3>
        {task.nextStep && !isDone && (
          <p className="task-card__next">🎯 {task.nextStep}</p>
        )}
        <div className="task-card__meta">
          {task.dueDate && (
            <span className={overdue ? 'task-card__due is-overdue' : 'task-card__due'}>
              🗓 {formatDue(task.dueDate, task.dueTime)}
            </span>
          )}
          {task.snoozeCount > 0 && !isDone && (
            <span className="task-card__snooze">😴 {task.snoozeCount}x</span>
          )}
          {!isDone && task.snoozeCount >= 2 && (
            <span className="risk-pill risk-pill--text">👀 adia bastante</span>
          )}
        </div>
      </div>

      <div className="task-card__actions">
        {!isDone && (
          <>
            <button
              className="icon-btn"
              onClick={handleQuick5}
              aria-label="Fazer por 5 minutos"
              title="Só 5 minutos"
            >⏱5</button>
            <button
              className="icon-btn"
              onClick={handleRemind}
              aria-label="Me lembrar"
              title="Lembrar"
            >🔔</button>
          </>
        )}
        {!isDone && (
          <button
            className="icon-btn"
            onClick={() => setSnoozing(true)}
            aria-label="Adiar tarefa"
            title="Adiar"
          >⏰</button>
        )}
        <button className="icon-btn" onClick={handleEdit} aria-label="Editar tarefa">✎</button>
        <button className="icon-btn icon-btn--danger" onClick={handleDelete} aria-label="Excluir tarefa">🗑</button>
      </div>

      {snoozing && <SnoozeDialog task={task} onClose={() => setSnoozing(false)} />}
    </article>
  )
}
