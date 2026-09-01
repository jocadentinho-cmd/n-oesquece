import { useState } from 'react'
import { useTasks } from '../context/TasksContext'

function extractError(err) {
  if (typeof err === 'string') return err
  if (err && err.message) {
    const m = String(err.message)
    if (/invalid login credentials|invalid_credentials/i.test(m)) return 'Email ou senha incorretos.'
    if (/already registered/i.test(m)) return 'Esse email já tem conta. Tenta entrar.'
    if (/not confirmed|email.*confirm/i.test(m)) return 'Confirma o email que te enviamos antes de entrar. 📧'
    return m
  }
  return 'Algo deu errado. Tenta de novo.'
}

export default function Login() {
  const { login, signup, syncError } = useTasks()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setDone('')
    if (!email || !password) {
      setError('Preenche o email e a senha.')
      return
    }
    setBusy(true)
    if (mode === 'login') {
      const { error } = await login(email, password)
      setBusy(false)
      if (error) setError(extractError(error))
      else setDone('Entrando...')
    } else {
      const { error, data } = await signup(email, password)
      setBusy(false)
      if (error) {
        setError(extractError(error))
      } else if (data && data.user && !data.session) {
        setDone('Conta criada! Confirma o email que te enviamos pra entrar. 📧')
      } else {
        setDone('Conta criada! Entrando...')
      }
      return
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__logo" aria-hidden="true">🧠</div>
        <h1 className="login__title">NÃO ESQUECE</h1>
        <p className="login__sub">
          Sua segunda memória digital. Suas tarefas seguem você no celular e no computador.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="modal__input"
            type="email"
            autoComplete="email"
            value={email}
            placeholder="voce@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="field-label" htmlFor="login-pass" style={{ marginTop: 12 }}>Senha</label>
          <input
            id="login-pass"
            className="modal__input"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />

          {(error || syncError) && <p className="login__error">⚠️ {error || syncError}</p>}
          {done && <p className="login__done">{done}</p>}

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy} style={{ marginTop: 16 }}>
            {busy ? 'Um segundo...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
          </button>
        </form>

        <button className="btn-text btn-block" style={{ marginTop: 14 }} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setDone(''); }}>
          {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  )
}
