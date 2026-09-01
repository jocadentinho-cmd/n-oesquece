import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { taskService } from '../services/taskService'
import { authService } from '../services/authService'
import { syncService } from '../services/syncService'
import { generateProfile } from '../services/onboardingService'

const TasksContext = createContext(null)

function errText(err) {
  if (typeof err === 'string') return err
  if (err && err.message) return String(err.message)
  return 'Algo deu errado.'
}

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [routine, setRoutine] = useState({ morning: [], school: [], night: [] })
  const [settings, setSettings] = useState({})
  const [onboarding, setOnboarding] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [syncError, setSyncError] = useState('')
  const syncedRef = useRef(false)
  const pushTimer = useRef(null)

  useEffect(() => {
    setTasks(taskService.listTasks())
    setEvents(taskService.listEvents())
    setRoutine(taskService.listRoutine())
    setSettings(taskService.getSettings())
    setOnboarding(taskService.getOnboarding())
    setLoaded(true)
  }, [])

  // Restaura a sessão e sincroniza ao logar
  useEffect(() => {
    let mounted = true
    const boot = async () => {
      const { session } = await authService.getSession()
      if (!mounted) return
      if (session && session.user) {
        setUser(session.user)
        const { error } = await syncService.syncOnLogin(session.user.id)
        if (error) setSyncError('Falha ao sincronizar dados.')
        if (mounted) {
          setTasks(taskService.listTasks())
          setEvents(taskService.listEvents())
          setRoutine(taskService.listRoutine())
          setSettings(taskService.getSettings())
          setOnboarding(taskService.getOnboarding())
          syncedRef.current = true
        }
      }
      if (mounted) setAuthLoading(false)
    }
    boot()
    const { data: sub } = authService.onAuthStateChange((session) => {
      if (!mounted) return
      setUser(session ? session.user : null)
      if (session && session.user) {
        syncService.syncOnLogin(session.user.id).then(({ error }) => {
          if (mounted) {
            setTasks(taskService.listTasks())
            setEvents(taskService.listEvents())
            setRoutine(taskService.listRoutine())
            setSettings(taskService.getSettings())
            setOnboarding(taskService.getOnboarding())
            syncedRef.current = true
          }
        })
      }
    })
    return () => {
      mounted = false
      if (sub && sub.subscription) sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (loaded) taskService.saveTasks(tasks)
  }, [tasks, loaded])

  useEffect(() => {
    if (loaded) taskService.saveEvents(events)
  }, [events, loaded])

  useEffect(() => {
    if (loaded) taskService.saveRoutine(routine)
  }, [routine, loaded])

  useEffect(() => {
    if (loaded) taskService.saveSettings(settings)
  }, [settings, loaded])

  // Empurra as mudanças para a nuvem (debounced) quando logado
  useEffect(() => {
    if (!loaded || !user) return
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      syncService.push(user.id).catch(() => setSyncError('Falha ao salvar na nuvem.'))
    }, 800)
    return () => clearTimeout(pushTimer.current)
  }, [tasks, events, routine, settings, loaded, user])

  const login = async (email, password) => {
    setSyncError('')
    const { error } = await authService.signIn(email, password)
    if (error) {
      setSyncError(errText(error))
      return { error: errText(error) }
    }
    return { error: null }
  }

  const signup = async (email, password) => {
    setSyncError('')
    const { data, error } = await authService.signUp(email, password)
    if (error) {
      setSyncError('Não deu pra criar a conta.')
      return { error: 'Não deu pra criar a conta.' }
    }
    return { data, error: null }
  }

  const logout = async () => {
    await authService.signOut()
    setUser(null)
  }

  const addTask = (data) => {
    const t = taskService.createTask(data)
    setTasks(taskService.listTasks())
    return t
  }

  const updateTask = (id, patch) => {
    const t = taskService.updateTask(id, patch)
    setTasks(taskService.listTasks())
    return t
  }

  const deleteTask = (id) => {
    taskService.deleteTask(id)
    setTasks(taskService.listTasks())
  }

  const completeTask = (id) => {
    taskService.completeTask(id)
    setTasks(taskService.listTasks())
  }

  const reuseTask = (id) => {
    taskService.reuse(id)
    setTasks(taskService.listTasks())
  }

  const bumpTask = (id) => {
    taskService.bump(id)
    setTasks(taskService.listTasks())
  }

  const addEvent = (data) => {
    const e = taskService.createEvent(data)
    setEvents(taskService.listEvents())
    return e
  }

  const updateEvent = (id, patch) => {
    const e = taskService.updateEvent(id, patch)
    setEvents(taskService.listEvents())
    return e
  }

  const deleteEvent = (id) => {
    taskService.deleteEvent(id)
    setEvents(taskService.listEvents())
  }

  const finishOnboarding = (answers) => {
    const profile = generateProfile(answers)
    // mescla rotina gerada com a já existente (se houver)
    const mergedRoutine = { morning: [], school: [], night: [] }
    ;['morning', 'school', 'night'].forEach((s) => {
      mergedRoutine[s] = profile.routine[s]
    })
    setRoutine(mergedRoutine)

    // cria tarefas iniciais
    profile.tasks.forEach((t) => taskService.createTask(t))
    setTasks(taskService.listTasks())

    // preferências
    const newSettings = { ...settings, ...profile.settings }
    setSettings(newSettings)

    const saved = { answers, doneAt: new Date().toISOString() }
    setOnboarding(saved)
    taskService.saveOnboarding(saved)
    return saved
  }

  const resetOnboarding = () => {
    setOnboarding(null)
    taskService.clearOnboarding()
  }

  const value = useMemo(
    () => ({
      tasks,
      events,
      routine,
      settings,
      onboarding,
      user,
      authLoading,
      syncError,
      login,
      signup,
      logout,
      setRoutine,
      setSettings,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      reuseTask,
      bumpTask,
      addEvent,
      updateEvent,
      deleteEvent,
      finishOnboarding,
      resetOnboarding,
      loaded,
    }),
    [tasks, events, routine, settings, onboarding, user, authLoading, syncError, loaded]
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  return useContext(TasksContext)
}
