import { useEffect, useState } from 'react'
import { useTasks } from '../context/TasksContext'
import { useUI } from '../context/UIContext'
import {
  supported,
  getPermission,
  requestPermission,
  showNotification,
} from '../services/notificationService'

export default function Configuracoes() {
  const { settings, setSettings, events } = useTasks()
  const { toast } = useUI()
  const [notif, setNotif] = useState(settings.notifications !== false)
  const [perm, setPerm] = useState('unsupported')

  useEffect(() => {
    setPerm(getPermission())
  }, [])

  const remindersActive = events.filter((e) => e.reminder && !e.reminderSent).length

  const refreshPerm = () => setPerm(getPermission())

  const enableNotifications = async () => {
    const result = await requestPermission()
    setPerm(getPermission())
    setSettings({ ...settings, notifications: result === 'granted' })
    if (result === 'granted') {
      setNotif(true)
      toast('Lembretes liberados! ⏰')
    } else {
      toast('Permissão negada. Você pode liberar no navegador depois.', 'warning')
    }
  }

  const testNotification = () => {
    const ok = showNotification('⏰ NÃO ESQUECE', 'Isso aqui é um teste. Funciona!')
    if (ok) toast('Notificação enviada! 🎉')
    else toast('Não foi possível enviar agora.', 'warning')
  }

  const clearAll = () => {
    if (window.confirm('Apagar todos os dados (tarefas, eventos e rotinas)? Isso não tem volta.')) {
      localStorage.removeItem('naoesquece.tasks.v1')
      localStorage.removeItem('naoesquece.events.v1')
      localStorage.removeItem('naoesquece.routine.v1')
      localStorage.removeItem('naoesquece.settings.v1')
      window.location.reload()
    }
  }

  const permStatus = {
    granted: { label: 'Permitidas', emoji: '✅' },
    denied: { label: 'Bloqueadas', emoji: '🚫' },
    default: { label: 'Não definido', emoji: '🔔' },
    unsupported: { label: 'Não suportado', emoji: '⚠️' },
  }[perm] || { label: perm, emoji: '🔔' }

  return (
    <div className="page">
      <section className="page__header">
        <h1>Configurações</h1>
        <p className="page__sub">Simples, como tem que ser.</p>
      </section>

      <section className="settings-group">
        <h2 className="settings-group__title">🔔 Lembretes</h2>

        <div className="notification-panel">
          <div className="setting-row">
            <div>
              <strong>Notificações do navegador</strong>
              <p>
                Status: <span className="perm-status">{permStatus.emoji} {permStatus.label}</span>
              </p>
            </div>
            <button
              role="switch"
              aria-checked={notif}
              aria-label="Ativar notificações"
              className={'switch' + (notif ? ' is-on' : '')}
              onClick={() => { setNotif((v) => !v); setSettings({ ...settings, notifications: !notif }) }}
            >
              <span className="switch__thumb" />
            </button>
          </div>

          {perm !== 'granted' && perm !== 'unsupported' && (
            <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} onClick={enableNotifications}>
              Permitir notificações
            </button>
          )}

          {perm === 'granted' && notif && (
            <button className="btn-ghost btn-block" style={{ marginTop: 8 }} onClick={testNotification}>
              Enviar notificação de teste
            </button>
          )}

          {perm === 'denied' && (
            <p className="field-hint" style={{ marginTop: 10, color: 'var(--warning)' }}>
              As notificações estão bloqueadas. Use o ícone de cadeado na barra de endereço do navegador
              para liberar a permissão deste site.
            </p>
          )}

          <p className="field-hint" style={{ marginTop: 12 }}>
            {remindersActive > 0
              ? `Você tem ${remindersActive} evento${remindersActive === 1 ? '' : 's'} com lembrete agendado. ⏰`
              : 'Configure um lembrete ao criar um evento para eu te avisar antes.'}
          </p>
        </div>
      </section>

      <section className="settings-group">
        <h2 className="settings-group__title">Como funciona</h2>
        <div className="notification-panel">
          <p className="page__sub">
            Os lembretes podem ser configurados como <strong>30 min</strong>, <strong>1 hora</strong>,{' '}
            <strong>2 dias</strong> ou <strong>1 semana</strong> antes do evento.
          </p>
          <p className="page__sub" style={{ marginTop: 8 }}>
            As notificações disparam enquanto o site estiver aberto. Para avisar com o site fechado,
            seria preciso um servidor (essa parte ainda não está ativa).
          </p>
        </div>
      </section>

      <section className="settings-group">
        <h2 className="settings-group__title">Privacidade</h2>
        <div className="notification-panel">
          <p className="page__sub" style={{ marginBottom: 12 }}>
            Seus dados ficam salvos só no seu navegador.
          </p>
          <button className="btn-text" style={{ color: 'var(--danger)' }} onClick={clearAll}>
            🗑 Apagar todos os dados
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
