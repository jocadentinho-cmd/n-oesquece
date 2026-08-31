import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <div className="empty">
        <div className="empty__emoji" aria-hidden="true">🤔</div>
        <h3 className="empty__title">Essa página não existe.</h3>
        <p className="empty__subtitle">Acho que você se esqueceu do caminho. Bora voltar?</p>
        <Link to="/hoje" className="btn btn-primary">Ir para Hoje</Link>
      </div>
    </div>
  )
}
