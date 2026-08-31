export default function ErrorState({ onRetry }) {
  return (
    <div className="empty">
      <div className="empty__emoji" aria-hidden="true">😕</div>
      <h3 className="empty__title">Algo deu errado.</h3>
      <p className="empty__subtitle">Não foi possível carregar esta página.</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}
