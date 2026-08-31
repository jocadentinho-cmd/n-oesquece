export const CATEGORIES = {
  escola: { label: 'Escola', emoji: '📚', color: 'blue' },
  trabalho: { label: 'Trabalho', emoji: '💼', color: 'primary' },
  casa: { label: 'Casa', emoji: '🏠', color: 'green' },
  pessoal: { label: 'Pessoal', emoji: '👤', color: 'lilac' },
  compromisso: { label: 'Compromisso', emoji: '📅', color: 'amber' },
  rotina: { label: 'Rotina', emoji: '🔁', color: 'cyan' },
}

export const PRIORITIES = {
  important: { label: 'Importante', emoji: '🔴', color: 'danger' },
  normal: { label: 'Normal', emoji: '🟡', color: 'warning' },
  calm: { label: 'Tranquilo', emoji: '🟢', color: 'success' },
}

export const RECURRENCE = {
  none: { label: 'Uma vez' },
  daily: { label: 'Todos os dias' },
  weekly: { label: 'Toda semana' },
  monthly: { label: 'Todo mês' },
}

export const STATUS = {
  pending: 'pending',
  done: 'done',
  archived: 'archived',
}

export const FORGET_RISK = {
  low: 'low',
  medium: 'medium',
  high: 'high',
}

export const EVENT_COLORS = [
  { key: 'primary', label: 'Roxo', hex: '#7c5cff' },
  { key: 'blue', label: 'Azul', hex: '#4f8bff' },
  { key: 'green', label: 'Verde', hex: '#2fe6a7' },
  { key: 'amber', label: 'Amarelo', hex: '#ffc53d' },
  { key: 'red', label: 'Vermelho', hex: '#ff5d6c' },
  { key: 'cyan', label: 'Ciano', hex: '#40d4ff' },
  { key: 'pink', label: 'Rosa', hex: '#ff6bb5' },
]

export function eventColor(key) {
  return EVENT_COLORS.find((c) => c.key === key) || EVENT_COLORS[0]
}
