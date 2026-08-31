import { NavLink } from 'react-router-dom'
import { useUI } from '../context/UIContext'

export default function BottomNavigation() {
  const { openTaskModal } = useUI()

  return (
    <nav className="bottomnav" aria-label="Navegação móvel">
      <NavLink to="/hoje" className={({ isActive }) => 'bn-item' + (isActive ? ' is-active' : '')}>
        <span className="bn-item__icon" aria-hidden="true">🏠</span>
        <span>Hoje</span>
      </NavLink>

      <button className="bn-add" onClick={() => openTaskModal()} aria-label="Nova tarefa">
        <span aria-hidden="true">＋</span>
      </button>

      <NavLink to="/tarefas" className={({ isActive }) => 'bn-item' + (isActive ? ' is-active' : '')}>
        <span className="bn-item__icon" aria-hidden="true">📋</span>
        <span>Tarefas</span>
      </NavLink>

      <NavLink to="/rotina" className={({ isActive }) => 'bn-item' + (isActive ? ' is-active' : '')}>
        <span className="bn-item__icon" aria-hidden="true">🔁</span>
        <span>Rotina</span>
      </NavLink>

      <NavLink to="/configuracoes" className={({ isActive }) => 'bn-item' + (isActive ? ' is-active' : '')}>
        <span className="bn-item__icon" aria-hidden="true">👤</span>
        <span>Conta</span>
      </NavLink>
    </nav>
  )
}
