export default function LoadingState({ label = 'Carregando…' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span className="loading__spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}
