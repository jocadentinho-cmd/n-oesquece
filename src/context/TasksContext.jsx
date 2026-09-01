import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { taskService } from '../services/taskService'
import { generateProfile } from '../services/onboardingService'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [routine, setRoutine] = useState({ morning: [], school: [], night: [] })
  const [settings, setSettings] = useState({})
  const [onboarding, setOnboarding] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTasks(taskService.listTasks())
    setEvents(taskService.listEvents())
    setRoutine(taskService.listRoutine())
    setSettings(taskService.getSettings())
    setOnboarding(taskService.getOnboarding())
    setLoaded(true)
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
    [tasks, events, routine, settings, onboarding, loaded]
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  return useContext(TasksContext)
}
