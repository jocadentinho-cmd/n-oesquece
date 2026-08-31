import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { taskService } from '../services/taskService'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [routine, setRoutine] = useState({ morning: [], school: [], night: [] })
  const [settings, setSettings] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTasks(taskService.listTasks())
    setEvents(taskService.listEvents())
    setRoutine(taskService.listRoutine())
    setSettings(taskService.getSettings())
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

  const value = useMemo(
    () => ({
      tasks,
      events,
      routine,
      settings,
      setRoutine,
      setSettings,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      reuseTask,
      addEvent,
      updateEvent,
      deleteEvent,
      loaded,
    }),
    [tasks, events, routine, settings, loaded]
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  return useContext(TasksContext)
}
