import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { taskService } from '../services/taskService'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [routine, setRoutine] = useState({ morning: [], school: [], night: [] })
  const [settings, setSettings] = useState({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTasks(taskService.listTasks())
    setRoutine(taskService.listRoutine())
    setSettings(taskService.getSettings())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) taskService.saveTasks(tasks)
  }, [tasks, loaded])

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

  const value = useMemo(
    () => ({
      tasks,
      routine,
      settings,
      setRoutine,
      setSettings,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      reuseTask,
      loaded,
    }),
    [tasks, routine, settings, loaded]
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  return useContext(TasksContext)
}
