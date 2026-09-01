/**
 * taskService — camada de abstração de armazenamento.
 * Hoje usa localStorage. No futuro pode ser trocado por um banco
 * (Supabase, API própria etc.) sem reescrever a interface.
 *
 * >>> PONTO DE INTEGRAÇÃO FUTURA <<<
 */

const KEYS = {
  tasks: 'naoesquece.tasks.v1',
  events: 'naoesquece.events.v1',
  routine: 'naoesquece.routine.v1',
  settings: 'naoesquece.settings.v1',
  onboarding: 'naoesquece.onboarding.v1',
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

export const CONTEXTS = ['casa', 'escola', 'trabalho', 'academia', 'rua', 'computador']

export const FORGET_SCORE = {
  score(task) {
    let score = 0
    if (!task) return 0
    if (task.priority === 'important') score += 25
    if (task.forgetRisk === 'high') score += 25
    if (task.forgetRisk === 'medium') score += 12
    if (task.snoozeCount && task.snoozeCount >= 2) score += 20
    else if (task.snoozeCount && task.snoozeCount >= 1) score += 10
    if (task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)) score += 30
    if (task.dueDate && !task.dueTime) score += 8
    if (Array.isArray(task.steps) && task.steps.length > 0) score += 10
    if (task.context && CONTEXTS.includes(task.context)) score += 5
    return Math.min(100, score)
  },
  level(score) {
    if (score >= 60) return 'high'
    if (score >= 30) return 'medium'
    return 'low'
  },
  label(score) {
    if (score >= 60) return { emoji: '🔴', text: 'Melhor não depender da memória' }
    if (score >= 30) return { emoji: '🟡', text: 'Vale lembrar' }
    return { emoji: '🟢', text: 'Tudo tranquilo' }
  },
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
      afterTaskId: data.afterTaskId || null,
      quick5: data.quick5 || false,
      firstStep: data.firstStep || null,
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

  // ---------- Eventos (calendário) ----------
  listEvents() {
    return read(KEYS.events, [])
  },
  saveEvents(events) {
    write(KEYS.events, events)
  },
  getEvent(id) {
    return this.listEvents().find((e) => e.id === id) || null
  },
  createEvent(data) {
    const events = this.listEvents()
    const event = {
      id: uid(),
      title: data.title || '',
      description: data.description || '',
      date: data.date || null,
      time: data.time || null,
      location: data.location || null,
      color: data.color || 'primary',
      allDay: data.allDay !== false,
      reminder: data.reminder || null,
      reminderSent: false,
      createdAt: new Date().toISOString(),
    }
    events.push(event)
    this.saveEvents(events)
    return event
  },
  updateEvent(id, patch) {
    const events = this.listEvents()
    const idx = events.findIndex((e) => e.id === id)
    if (idx === -1) return null
    events[idx] = { ...events[idx], ...patch }
    this.saveEvents(events)
    return events[idx]
  },
  deleteEvent(id) {
    const events = this.listEvents().filter((e) => e.id !== id)
    this.saveEvents(events)
  },

  // ---------- Onboarding (perfil do usuário) ----------
  getOnboarding() {
    return read(KEYS.onboarding, null)
  },
  saveOnboarding(profile) {
    write(KEYS.onboarding, profile)
  },
  clearOnboarding() {
    localStorage.removeItem(KEYS.onboarding)
  },

  // ---------- Radar de esquecimento ----------
  // "Lembrar" (bump): traz a tarefa para hoje/horário próximo e sobe o risco,
  // para que ela apareça em "ANTES QUE VOCÊ ESQUEÇA".
  bump(id) {
    const tasks = this.listTasks()
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return null
    const t = tasks[idx]
    const today = new Date().toISOString().slice(0, 10)
    let score = FORGET_SCORE.score(t)
    tasks[idx] = {
      ...t,
      dueDate: t.dueDate && t.dueDate >= today ? t.dueDate : today,
      dueTime: t.dueTime || defaultDueTime(),
      forgetRisk: score >= 30 ? FORGET_SCORE.level(score) : 'medium',
      status: 'pending',
    }
    this.saveTasks(tasks)
    return tasks[idx]
  },
  listContextTasks(context) {
    if (!context) return []
    return this.listTasks().filter((t) => t.status === 'pending' && t.context === context)
  },
}

function defaultDueTime() {
  const h = new Date().getHours()
  if (h < 12) return '12:00'
  if (h < 18) return '18:00'
  return '21:00'
}
