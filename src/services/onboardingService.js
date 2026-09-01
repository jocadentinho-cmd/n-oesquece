/**
 * onboardingService — gera rotinas, tarefas e preferências
 * a partir das respostas do formulário de boas-vindas.
 */

function routineItem(label) {
  return { id: Date.now() + '-' + Math.random().toString(36).slice(2, 8), label }
}

// Mapeia o que a pessoa marcou que "sempre esquece" para itens de rotina.
const FORGET_ROTINE = {
  // Casa
  cama: { label: 'Arrumar a cama', section: 'morning' },
  roupa: { label: 'Lavar/separar a roupa', section: 'night' },
  louca: { label: 'Lavar a louça', section: 'night' },
  lixo: { label: 'Tirar o lixo', section: 'night' },
  mercado: { label: 'Comprar no mercado', section: 'morning' },
  quarto: { label: 'Limpar o quarto', section: 'morning' },
  acordar: { label: 'Acordar na hora', section: 'morning' },

  // Escola
  dever: { label: 'Conferir os deveres de casa', section: 'school' },
  mochila: { label: 'Conferir a mochila antes de sair', section: 'school' },
  prazo: { label: 'Revisar prazos de trabalho', section: 'school' },
  prova: { label: 'Estudar para a prova', section: 'school' },

  // Trabalho
  compromisso: { label: 'Revisar compromissos do dia', section: 'school' },
  reuniao: { label: 'Conferir reuniões do trabalho', section: 'school' },
  contas: { label: 'Pagar contas / ir ao banco', section: 'night' },

  // Pessoal
  documento: { label: 'Pegar o documento antes de sair', section: 'morning' },
  remedio: { label: 'Tomar o remédio', section: 'morning' },
  familia: { label: 'Avisar a família', section: 'night' },
  dentes: { label: 'Escovar os dentes', section: 'morning' },
  exercicio: { label: 'Praticar exercício', section: 'night' },
}

// Tarefas iniciais criadas a partir de opções sensíveis.
const OPTION_TASKS = {
  prazo: { title: 'Organizar os prazos desta semana', category: 'escola' },
  reuniao: { title: 'Revisar a agenda de trabalho', category: 'trabalho' },
  mercado: { title: 'Fazer a lista do mercado', category: 'casa' },
  prova: { title: 'Definir um horário de estudo', category: 'escola' },
}

function buildRoutine(answers) {
  const section = { morning: [], school: [], night: [] }
  const used = new Set()
  const push = (key) => {
    if (used.has(key)) return
    const def = FORGET_ROTINE[key]
    if (!def) return
    used.add(key)
    section[def.section].push(routineItem(def.label))
  }

  // Sempre presentes (básicos)
  push('dentes')
  push('acordar')

  // Itens marcados pela pessoa
  ;(answers.forget || []).forEach(push)

  // Reforços por perfil
  if (answers.student && !answers.forget.includes('mochila')) push('mochila')
  if (answers.works && !answers.forget.includes('compromisso')) push('compromisso')

  return section
}

function buildTasks(answers) {
  const tasks = []
  const forget = answers.forget || []
  Object.entries(OPTION_TASKS).forEach(([key, def]) => {
    if (forget.includes(key)) {
      tasks.push({ ...def, originalInput: '' })
    }
  })
  return tasks
}

/**
 * Gera o perfil completo a partir das respostas.
 * Retorna { routine, tasks, settings }.
 */
export function generateProfile(answers) {
  const routine = buildRoutine(answers)
  const tasks = buildTasks(answers)

  const settings = {}
  if (answers.reminder) {
    settings.notifications = answers.reminder === 'both' || answers.reminder === 'notification'
  } else {
    settings.notifications = true
  }
  // Melhor horário preferido para lembrar
  if (answers.recurring) settings.bestTime = answers.recurring[0] || 'night'

  return { routine, tasks, settings }
}
