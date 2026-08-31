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
