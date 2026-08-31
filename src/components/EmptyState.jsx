export default function EmptyState({ emoji = '🎉', title, subtitle, action, onAction, actionLabel }) {
  return (
    <div className="empty">
      <div className="empty__emoji" aria-hidden="true">{emoji}</div>
      <h3 className="empty__title">{title}</h3>
      {subtitle && <p className="empty__subtitle">{subtitle}</p>}
      {action && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel || action}
        </button>
      )}
    </div>
  )
}
