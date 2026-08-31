import { useUI } from '../context/UIContext'

export default function Toasts() {
  const { toasts } = useUI()
  if (toasts.length === 0) return null
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="status">
          {t.message}
        </div>
      ))}
    </div>
  )
}
