import { useState } from 'react'
import { useTasks } from '../context/TasksContext'
import { useUI } from '../context/UIContext'

export default function Configuracoes() {
  const { settings, setSettings } = useTasks()
  const { toast } = useUI()
  const [notif, setNotif] = useState(settings.notifications !== false)

  const toggleNotifications = async () => {
    const next = !notif
    setNotif(next)
    setSettings({ ...settings, notifications: next })
    if (next && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission()
        toast(perm === 'granted' ? 'Lembretes liberados! 🎉' : 'Pode ativar depois.')
        return
      }
      toast(next ? 'Lembretes ativos.' : 'Lembretes desativados.')
    } else {
      toast(next ? 'Preferência salva.' : 'Lembretes desativados.')
    }
  }

  return (
    <div className="page">
      <section className="page__header">
        <h1>Configurações</h1>
        <p className="page__sub">Simples, como tem que ser.</p>
      </section>

      <section className="settings-group">
        <h2 className="settings-group__title">Lembretes</h2>
        <div className="setting-row">
          <div>
            <strong>Notificações</strong>
            <p>Avisa quando chegar a hora de uma tarefa.</p>
          </div>
          <button
            role="switch"
            aria-checked={notif}
            aria-label="Ativar notificações"
            className={'switch' + (notif ? ' is-on' : '')}
            onClick={toggleNotifications}
          >
            <span className="switch__thumb" />
          </button>
        </div>
      </section>

      <section className="settings-group">
        <h2 className="settings-group__title">Sobre</h2>
        <div className="about-card">
          <strong style={{ display: 'block' }}>NÃO ESQUECE</strong>
          <p className="page__sub">Você não precisa lembrar de tudo. Eu lembro por você.</p>
          <p className="page__sub" style={{ marginTop: 8, color: 'var(--text-3)' }}>
            v1.0 · Seus dados ficam salvos só no seu navegador.
          </p>
        </div>
      </section>
    </div>
  )
}
