/**
 * parser — interpretação natural simples baseada em regras.
 * FASE 8: pode ser substituída por IA real posteriormente.
 * NUNCA apaga o texto original (retornado em originalInput).
 */
import { todayISO, toISODate } from '../utils/date'

const dayMap = [
  { key: 'domingo', iso: 0 },
  { key: 'segunda', iso: 1 },
  { key: 'terça', iso: 2 },
  { key: 'terca', iso: 2 },
  { key: 'quarta', iso: 3 },
  { key: 'quinta', iso: 4 },
  { key: 'sexta', iso: 5 },
  { key: 'sábado', iso: 6 },
  { key: 'sabado', iso: 6 },
  { key: 'sab', iso: 6 },
  { key: 'sex', iso: 5 },
  { key: 'qui', iso: 4 },
  { key: 'qua', iso: 3 },
]

const categoryKeywords = [
  { cat: 'escola', words: ['trabalho', 'prova', 'estudar', 'física', 'matemática', 'escola', 'lição', 'dever', 'redação', 'apresentação', 'projeto', 'aula', 'portugu', 'história', 'química', 'biologia', 'geografia', 'ingl'] },
  { cat: 'trabalho', words: ['reunião', 'relatório', 'e-mail', 'email', 'cliente', 'entrega', 'escrit'] },
  { cat: 'casa', words: ['comprar', 'mercado', 'lavar', 'limpar', 'arrumar', 'cozinha', 'roupa', 'louça', 'faxina', 'cartolina'] },
  { cat: 'compromisso', words: ['dentista', 'médico', 'consulta', 'compromisso', 'marcar', 'cabeleireiro', 'banco', 'entrevista'] },
  { cat: 'rotina', words: ['escovar', 'preparar', 'acordar', 'dormir', 'mochila', 'sempre'] },
]

function addDaysISOFrom(iso, days) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

function nextWeekdayISO(target) {
  const today = todayISO()
  const todayIdx = new Date().getDay()
  let diff = target - todayIdx
  if (diff < 0) diff += 7
  return addDaysISOFrom(today, diff)
}

function findDay(text) {
  const hay = text.toLowerCase()

  if (/\bhoje\b/.test(hay)) return { date: todayISO(), label: 'Hoje' }
  if (/\bamanh[aã]\b/.test(hay)) return { date: addDaysISOFrom(todayISO(), 1), label: 'Amanhã' }

  for (const d of dayMap) {
    const re = new RegExp(`\\b${d.key}\\b`, 'i')
    if (re.test(hay)) return { date: nextWeekdayISO(d.iso), label: d.key }
  }

  const dm = hay.match(/(\d{2})\/(\d{2})/)
  if (dm) {
    const today = new Date()
    let m = parseInt(dm[2], 10) - 1
    let day = parseInt(dm[1], 10)
    let y = today.getFullYear()
    if (m < today.getMonth()) y += 1
    return { date: toISODate(new Date(y, m, day)), label: dm[0] }
  }
  return null
}

function findCategory(text) {
  const t = text.toLowerCase()
  for (const entry of categoryKeywords) {
    for (const w of entry.words) {
      const re = new RegExp(`\\b${w}`, 'i')
      if (re.test(t)) return entry.cat
    }
  }
  return null
}

function findPriority(text, category) {
  const t = text.toLowerCase()
  if (/urgente|importante|prazo|entregar/i.test(t)) return 'important'
  if (category === 'compromisso') return 'important'
  return 'normal'
}

function cleanTitle(text) {
  return text.replace(/^[+\-\s]+/, '').trim()
}

/**
 * Interpreta texto natural. Retorna um objeto parcial de tarefa.
 * O texto original é sempre preservado em originalInput.
 */
export function interpret(text) {
  const original = text.trim()
  if (!original) return null

  const day = findDay(original)
  const category = findCategory(original)
  const priority = findPriority(original, category)

  return {
    title: cleanTitle(original),
    description: '',
    category,
    priority,
    dueDate: day ? day.date : null,
    dayLabel: day ? day.label : null,
    originalInput: original,
  }
}

// re-export para clareza quando necessário
export const interpretHelpers = { nextWeekdayISO, addDaysISOFrom }
