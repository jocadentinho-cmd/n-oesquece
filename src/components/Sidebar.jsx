import { NavLink } from 'react-router-dom'
import { useUI } from '../context/UIContext'

const ITEMS = [
  { to: '/hoje', label: 'Hoje', icon: '🏠' },
  { to: '/tarefas', label: 'Tarefas', icon: '📋' },
  { to: '/rotina', label: 'Rotina', icon: '🔁' },
  { to: '/historico', label: 'Histórico', icon: '📊' },
  { to: '/configuracoes', label: 'Configurações', icon: '⚙️' },
]

export default function Sidebar() {
  const { openTaskModal, openForgot } = useUI()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">🧠</span>
        <div>
          <strong className="sidebar__name">NÃO ESQUECE</strong>
          <span className="sidebar__tag">Eu lembro por você</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Navegação principal">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' is-active' : '')}
          >
            <span className="nav-item__icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__actions">
        <button className="btn btn-primary btn-block" onClick={() => openTaskModal()}>
          <span aria-hidden="true">＋</span> Nova tarefa
        </button>
        <button className="btn-ghost btn-block" onClick={openForgot}>
          😭 Esqueci alguma coisa
        </button>
      </div>
    </aside>
  )
}
