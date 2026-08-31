/**
 * taskService — camada de abstração de armazenamento.
 * Hoje usa localStorage. No futuro pode ser trocado por um banco
 * (Supabase, API própria etc.) sem reescrever a interface.
 *
 * >>> PONTO DE INTEGRAÇÃO FUTURA <<<
 */

const KEYS = {
  tasks: 'naoesquece.tasks.v1',
  routine: 'naoesquece.routine.v1',
  settings: 'naoesquece.settings.v1',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export const taskService = {
  listTasks() {
    return read(KEYS.tasks, [])
  },
  saveTasks(tasks) {
    write(KEYS.tasks, tasks)
  },
  getTask(id) {
    return this.listTasks().find((t) => t.id === id) || null
  },
  createTask(data) {
    const tasks = this.listTasks()
    const task = {
      id: uid(),
      title: data.title || '',
      description: data.description || '',
      category: data.category || 'pessoal',
      priority: data.priority || 'normal',
      status: data.status || 'pending',
      dueDate: data.dueDate || null,
      dueTime: data.dueTime || null,
      recurrence: data.recurrence || 'none',
      nextStep: data.nextStep || null,
      forgetRisk: data.forgetRisk || 'low',
      snoozeCount: data.snoozeCount || 0,
      reminder: data.reminder || null,
      originalInput: data.originalInput || '',
      context: data.context || null,
      location: data.location || null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      snoozes: data.snoozes || [],
      steps: data.steps || [],
    }
    tasks.unshift(task)
    this.saveTasks(tasks)
    return task
  },
  updateTask(id, patch) {
    const tasks = this.listTasks()
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return null
    tasks[idx] = { ...tasks[idx], ...patch }
    this.saveTasks(tasks)
    return tasks[idx]
  },
  deleteTask(id) {
    const tasks = this.listTasks().filter((t) => t.id !== id)
    this.saveTasks(tasks)
  },
  completeTask(id) {
    return this.updateTask(id, {
      status: 'done',
      completedAt: new Date().toISOString(),
    })
  },
  reuse(id) {
    return this.updateTask(id, {
      status: 'pending',
      completedAt: null,
      dueDate: null,
      dueTime: null,
    })
  },
  listRoutine() {
    return read(KEYS.routine, { morning: [], school: [], night: [] })
  },
  saveRoutine(routine) {
    write(KEYS.routine, routine)
  },
  getSettings() {
    return read(KEYS.settings, {})
  },
  saveSettings(settings) {
    write(KEYS.settings, settings)
  },
}
