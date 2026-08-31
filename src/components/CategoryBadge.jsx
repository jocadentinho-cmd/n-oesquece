import { CATEGORIES } from '../config/taskTypes'

export default function CategoryBadge({ category }) {
  const cat = CATEGORIES[category] || CATEGORIES.pessoal
  return (
    <span className={`badge badge--${cat.color}`}>
      <span aria-hidden="true">{cat.emoji}</span> {cat.label}
    </span>
  )
}
