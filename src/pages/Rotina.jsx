import { useState } from 'react'
import { useTasks } from '../context/TasksContext'
import { useUI } from '../context/UIContext'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'

const sections = [
  { key: 'morning', title: '🌅 MANHÃ' },
  { key: 'school', title: '🏫 ESCOLA' },
  { key: 'night', title: '🌙 NOITE' },
]

const DAYS = [
  { key: 'D', label: 'Dom' },
  { key: 'S', label: 'Seg' },
  { key: 'T', label: 'Ter' },
  { key: 'Q', label: 'Qua' },
  { key: 'Q', label: 'Qui' },
  { key: 'S', label: 'Sex' },
  { key: 'S', label: 'Sáb' },
]

export default function Rotina() {
  const { routine, setRoutine, loaded } = useTasks()
  const { toast } = useUI()
  const [activeSection, setActiveSection] = useState('morning')
  const [draft, setDraft] = useState('')

  const key = activeSection
  const items = routine[key] || []

  const toggleDay = (idx) => {
    const daysMap = routine.days || {}
    const list = (daysMap[key] || []).slice()
    const index = list.indexOf(idx)
    if (index >= 0) list.splice(index, 1)
    else list.push(idx)
    setRoutine({ ...routine, days: { ...daysMap, [key]: list.sort() } })
  }

  const addItem = (e) => {
    e.preventDefault()
    const label = draft.trim()
    if (!label) {
      toast('Escreve o hábito primeiro ✍️', 'warning')
      return
    }
    const item = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 6), label }
    const current = Array.isArray(items) ? items : []
    setRoutine({ ...routine, [key]: [...current, item] })
    setDraft('')
    toast('Tá no repeat. 🔁')
  }

  const removeItem = (id) => {
    const current = Array.isArray(items) ? items : []
    setRoutine({ ...routine, [key]: current.filter((i) => i.id !== id) })
  }

  const total = sections.reduce((acc, s) => {
    const it = routine[s.key]
    const n = Array.isArray(it) ? it.length : 0
    return acc + n
  }, 0)

  return (
    <div className="page">
      <section className="page__header">
        <h1>Rotina</h1>
        <p className="page__sub">Os hábitos que se repetem. Eu lembro pra você todo dia.</p>
      </section>

      {!loaded ? (
        <LoadingState />
      ) : (
        <>
          <div className="segmented" role="tablist" aria-label="Seções da rotina">
            {sections.map((s) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={activeSection === s.key}
                className={'segmented__btn' + (activeSection === s.key ? ' is-active' : '')}
                onClick={() => setActiveSection(s.key)}
              >
                {s.title}
              </button>
            ))}
          </div>

          <form className="quickadd" onSubmit={addItem} style={{ marginBottom: 18 }}>
            <span className="quickadd__plus" aria-hidden="true">＋</span>
            <input
              className="quickadd__input"
              type="text"
              value={draft}
              placeholder="Ex: arrumar a cama"
              aria-label="Novo item de rotina"
              onChange={(e) => setDraft(e.target.value)}
            />
            <button className="btn btn-primary quickadd__btn" type="submit">Adicionar</button>
          </form>

          <section className="routine-card" style={{ marginBottom: 16 }}>
            <h2 className="routine-card__title">🔁 Repetir em</h2>
            <div className="day-select">
              {DAYS.map((d, idx) => {
                const active = (routine.days && routine.days[key]) ? routine.days[key].includes(idx) : false
                return (
                  <button
                    key={idx}
                    type="button"
                    className={'day-select__btn' + (active ? ' is-active' : '')}
                    onClick={() => toggleDay(idx)}
                    aria-pressed={active}
                    title={d.label}
                  >
                    {d.key}
                  </button>
                )
              })}
            </div>
            <p className="page__sub" style={{ marginTop: 8, fontSize: 12 }}>
              Se nenhum dia estiver marcado, lembramos todos os dias.
            </p>
          </section>

          {total === 0 ? (
            <EmptyState
              emoji="🔁"
              title="Nenhuma rotina ainda."
              subtitle="Adicione um hábito acima. Ex: arrumar a cama, escovar os dentes…"
            />
          ) : (
            <ul className="routine-items">
              {(Array.isArray(items) ? items : []).map((item) => (
                <li className="routine-item" key={item.id}>
                  <span className="routine-item__check">☐</span>
                  <span className="routine-item__label">{item.label}</span>
                  <button className="icon-btn icon-btn--danger" onClick={() => removeItem(item.id)} aria-label="Remover">🗑</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
