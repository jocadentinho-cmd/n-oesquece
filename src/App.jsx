import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TasksProvider } from './context/TasksContext'
import { UIProvider } from './context/UIContext'

import Sidebar from './components/Sidebar'
import BottomNavigation from './components/BottomNavigation'
import TaskModal from './components/TaskModal'
import EventModal from './components/EventModal'
import ForgotModal from './components/ForgotModal'
import Toasts from './components/Toasts'
import FocusMode from './components/FocusMode'

import Hoje from './pages/Hoje'
import Tarefas from './pages/Tarefas'
import Rotina from './pages/Rotina'
import Historico from './pages/Historico'
import Configuracoes from './pages/Configuracoes'
import Calendario from './pages/Calendario'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <TasksProvider>
      <UIProvider>
        <BrowserRouter>
          <div className="app-shell">
            <Sidebar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Navigate to="/hoje" replace />} />
                <Route path="/hoje" element={<Hoje />} />
                <Route path="/tarefas" element={<Tarefas />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/rotina" element={<Rotina />} />
                <Route path="/historico" element={<Historico />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNavigation />
            <TaskModal />
            <EventModal />
            <ForgotModal />
            <Toasts />
            <FocusMode />
          </div>
        </BrowserRouter>
      </UIProvider>
    </TasksProvider>
  )
}
