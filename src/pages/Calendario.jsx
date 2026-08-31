import { useMemo, useState } from 'react'
import { useTasks } from '../context/TasksContext'
import { useUI } from '../context/UIContext'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import { eventColor } from '../config/taskTypes'
import {
  todayISO,
  buildMonthGrid,
  monthName,
  formatEventDate,
  fullDateLabel,
  parseISODate,
} from '../utils/date'

const SHORT_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function Calendario() {
  const { events, loaded } = useTasks()
  const { openEventModal } = useUI()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState(todayISO())

  const today = todayISO()

  const eventsByDate = useMemo(() => {
    const map = {}
    for (const e of events) {
      if (e.date) {
        if (!map[e.date]) map[e.date] = []
        map[e.date].push(e)
      }
    }
    return map
  }, [events])

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])

  const selectedEvents = useMemo(() => {
    const list = eventsByDate[selected] || []
    return list.slice().sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  }, [eventsByDate, selected])

  const upcoming = useMemo(() => {
    return events
      .filter((e) => e.date && e.date >= today)
      .sort((a, b) => {
        if (a.date === b.date) return (a.time || '').localeCompare(b.time || '')
        return a.date.localeCompare(b.date)
      })
  }, [events, today])

  const eventDotColor = (iso) => {
    const list = eventsByDate[iso]
    if (!list) return null
    return list
  }

  const changeMonth = (delta) => {
    let m = month + delta
    let y = year
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setMonth(m)
    setYear(y)
  }

  const goToday = () => {
    const n = new Date()
    setYear(n.getFullYear())
    setMonth(n.getMonth())
    setSelected(todayISO())
  }

  const handleDayClick = (iso, inMonth) => {
    setSelected(iso)
    if (!inMonth) {
      const d = parseISODate(iso)
      setYear(d.getFullYear())
      setMonth(d.getMonth())
    }
  }

  const dayEvents = eventDotColor(selected)

  const timeline = upcoming.length > 0 ? upcoming : null

  return (
    <div className="page">
      <section className="page__header calendario-header">
        <h1>Calendário</h1>
        <p className="page__sub">Seus eventos e o que vem por aí, bem na frente dos seus olhos.</p>
      </section>

      {!loaded ? (
        <LoadingState />
      ) : (
        <>
          {/* ============ Grade do mês ============ */}
          <section className="cal-card">
            <div className="cal-card__head">
              <button className="cal-nav" onClick={() => changeMonth(-1)} aria-label="Mês anterior">◀</button>
              <h2 className="cal-card__month">
                {monthName(month)} {year}
              </h2>
              <button className="cal-nav" onClick={() => changeMonth(1)} aria-label="Próximo mês">▶</button>
            </div>

            <button className="cal-today" onClick={goToday}>Ir para hoje</button>

            <div className="cal-weekdays">
              {SHORT_DAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="cal-grid">
              {cells.map((c) => {
                const dayEvts = eventsByDate[c.iso] || []
                const isToday = c.iso === today
                const isSelected = c.iso === selected
                return (
                  <button
                    key={c.iso}
                    className={
                      'cal-day' +
                      (isToday ? ' is-today' : '') +
                      (isSelected ? ' is-selected' : '') +
                      (c.inMonth ? '' : ' is-muted')
                    }
                    onClick={() => handleDayClick(c.iso, c.inMonth)}
                    aria-label={`Dia ${c.day}`}
                  >
                    <span className="cal-day__num">{c.day}</span>
                    <div className="cal-day__dots">
                      {dayEvts.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="cal-dot"
                          style={{ background: eventColor(e.color).hex }}
                          title={e.title}
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* ============ Eventos do dia selecionado ============ */}
          <section className="day-section">
            <div className="day-section__head">
              <h2 className="today-section__title" style={{ marginBottom: 0 }}>
                📅 {fullDateLabel(selected)}
              </h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => openEventModal(selected)}
              >
                ＋ Novo
              </button>
            </div>

            {(!dayEvents || dayEvents.length === 0) ? (
              <p className="page__sub" style={{ padding: '8px 2px' }}>
                Nenhum evento nesse dia. Clique em "Novo" para criar.
              </p>
            ) : (
              <ul className="event-list">
                {selectedEvents.map((e) => (
                  <li key={e.id}>
                    <div className="event-chip" onClick={() => openEventModal(e.date, e)} role="button" tabIndex={0}>
                      <span className="event-chip__bar" style={{ background: eventColor(e.color).hex }} />
                      <div className="event-chip__body">
                        <strong>{e.title}</strong>
                        <span className="event-chip__meta">
                          {e.allDay ? 'Dia inteiro' : (e.time || '')}
                          {e.location ? ` · ${e.location}` : ''}
                        </span>
                      </div>
                      <button
                        className="icon-btn"
                        onClick={(ev) => { ev.stopPropagation(); openEventModal(e.date, e) }}
                        aria-label="Editar evento"
                      >✎</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ============ Timeline dos próximos eventos ============ */}
          <section className="today-section">
            <h2 className="today-section__title">🕒 PRÓXIMOS EVENTOS</h2>
            {!timeline ? (
              <EmptyState
                emoji="🗓"
                title="Nenhum evento por vir."
                subtitle="Adicione um evento no calendário acima para vê-lo aqui."
                actionLabel="Criar evento"
                onAction={() => openEventModal(today)}
              />
            ) : (
              <ol className="timeline">
                {timeline.slice(0, 12).map((e) => (
                  <li className="timeline__item" key={e.id}>
                    <span
                      className="timeline__dot"
                      style={{ background: eventColor(e.color).hex }}
                    />
                    <div className="timeline__content">
                      <span className="timeline__date">{formatEventDate(e.date, e.time)}</span>
                      <strong className="timeline__title">{e.title}</strong>
                      {e.location && <span className="timeline__meta">📍 {e.location}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </div>
  )
}
