import { PRIORITIES } from '../config/taskTypes'

export default function PriorityBadge({ priority }) {
  const p = PRIORITIES[priority] || PRIORITIES.normal
  return (
    <span className={`badge-priority badge-priority--${p.color}`} title={p.label}>
      <span aria-hidden="true">{p.emoji}</span>
    </span>
  )
}
