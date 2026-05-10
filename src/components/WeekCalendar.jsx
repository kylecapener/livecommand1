import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './WeekCalendar.module.css'

export const HOUR_HEIGHT = 64        // px per hour
export const SLOT_HEIGHT = 16        // px per 15-min slot
export const EVENT_DURATION = 60     // default duration in minutes
export const START_HOUR = 0
export const END_HOUR = 24
export const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR)

export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTop(minutes) {
  return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
}

export function roundToQuarter(date) {
  const m = date.getMinutes()
  const rounded = Math.floor(m / 15) * 15
  return `${String(date.getHours()).padStart(2,'0')}:${String(rounded).padStart(2,'0')}`
}

function formatHour(h) {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}

function get7Days(startDate) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d
  })
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}

function getEventsForDay(events, date) {
  const ds = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
  return events.filter(e => e.date === ds)
}

// Detect overlapping events and assign columns
function layoutEvents(events) {
  const sorted = [...events].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
  const columns = []
  const result = sorted.map(ev => {
    const start = timeToMinutes(ev.time)
    const end = start + EVENT_DURATION
    let col = 0
    while (columns[col] && columns[col] > start) col++
    columns[col] = end
    return { ev, col, totalCols: 1 }
  })
  // Assign totalCols
  result.forEach(item => {
    const start = timeToMinutes(item.ev.time)
    const end = start + EVENT_DURATION
    let maxCol = item.col
    result.forEach(other => {
      const os = timeToMinutes(other.ev.time)
      const oe = os + EVENT_DURATION
      if (other !== item && os < end && oe > start) maxCol = Math.max(maxCol, other.col)
    })
    item.totalCols = maxCol + 1
  })
  return result
}

function EventBubble({ item, onClick }) {
  const { ev, col, totalCols } = item
  const top = minutesToTop(timeToMinutes(ev.time))
  const height = Math.max((EVENT_DURATION / 60) * HOUR_HEIGHT - 2, 28)
  const widthPct = 100 / totalCols
  const leftPct = col * widthPct

  const isPublic = ev.type === 'public'
  const allConfirmed = Object.values(ev.statuses).every(s => s === 'confirmed')

  return (
    <div
      className={`${styles.event} ${isPublic ? styles.eventPublic : styles.eventPrivate} ${allConfirmed ? styles.eventConfirmed : ''}`}
      style={{
        top,
        height,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
      }}
      onClick={e => { e.stopPropagation(); onClick?.(ev) }}
    >
      <span className={styles.eventFormat}>{ev.format}</span>
      <span className={styles.eventName}>{ev.organizerName}</span>
      {(ev.gloves || ev.lightnings || ev.mist || ev.timers) && (
        <span className={styles.eventRules}>
          {ev.gloves && '🥊'}{ev.lightnings && '⚡'}{ev.mist && '🌫'}{ev.timers && '⏱'}
        </span>
      )}
    </div>
  )
}

export default function WeekCalendar({ events = [], onSlotClick, onEventClick }) {
  const scrollRef = useRef(null)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const days = get7Days(startDate)
  const today = new Date(); today.setHours(0,0,0,0)

  const now = new Date()
  const nowTop = minutesToTop(now.getHours() * 60 + now.getMinutes())

  useEffect(() => {
    if (scrollRef.current) {
      const scrollTo = Math.max(0, nowTop - 120)
      scrollRef.current.scrollTop = scrollTo
    }
  }, [])

  const prevWeek = () => { const d = new Date(startDate); d.setDate(d.getDate() - 7); setStartDate(d) }
  const nextWeek = () => { const d = new Date(startDate); d.setDate(d.getDate() + 7); setStartDate(d) }
  const goToday  = () => { const d = new Date(); d.setHours(0,0,0,0); setStartDate(d) }

  const handleSlotClick = useCallback((day, hour, quarter) => {
    const time = `${String(hour).padStart(2,'0')}:${String(quarter * 15).padStart(2,'0')}`
    const dateStr = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`
    onSlotClick?.({ date: dateStr, time })
  }, [onSlotClick])

  const weekLabel = (() => {
    const opts0 = { month: 'short', day: 'numeric' }
    const opts6 = { month: 'short', day: 'numeric', year: 'numeric' }
    return `${days[0].toLocaleDateString('en-US', opts0)} – ${days[6].toLocaleDateString('en-US', opts6)}`
  })()

  return (
    <div className={styles.wrapper}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <button className={styles.navBtn} onClick={prevWeek} aria-label="Previous week">‹</button>
          <button className={styles.navBtn} onClick={nextWeek} aria-label="Next week">›</button>
          <button className={styles.todayBtn} onClick={goToday}>Today</button>
          <span className={styles.weekLabel}>{weekLabel}</span>
        </div>
        <button className={styles.createBtn} onClick={() => onSlotClick?.({ date: null, time: null })}>
          + Create Series
        </button>
      </div>

      {/* Sticky day headers */}
      <div className={styles.dayHeaders}>
        <div className={styles.timeGutter} />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <div key={i} className={`${styles.dayHeader} ${isToday ? styles.dayHeaderToday : ''}`}>
              <span className={styles.dayName}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ''}`}>
                {day.getDate()}
              </span>
            </div>
          )
        })}
      </div>

      {/* Scrollable grid */}
      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.gridRow}>
          {/* Time labels */}
          <div className={styles.timeLabels}>
            {HOURS.map(h => (
              <div key={h} className={styles.hourLabel} style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}>
                {h % 1 === 0 ? formatHour(h) : ''}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className={styles.daysArea}>
            {/* Hour grid lines (shared background) */}
            <div className={styles.gridLines} style={{ height: TOTAL_HEIGHT }}>
              {HOURS.map(h => (
                <div key={h} className={styles.hourLine} style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}>
                  <div className={styles.quarterLine} style={{ top: HOUR_HEIGHT * 0.25 }} />
                  <div className={styles.quarterLine} style={{ top: HOUR_HEIGHT * 0.5 }} />
                  <div className={styles.quarterLine} style={{ top: HOUR_HEIGHT * 0.75 }} />
                </div>
              ))}
            </div>

            {days.map((day, di) => {
              const dayEvents = getEventsForDay(events, day)
              const laid = layoutEvents(dayEvents)
              const isToday = isSameDay(day, today)

              return (
                <div
                  key={di}
                  className={`${styles.dayCol} ${isToday ? styles.dayColToday : ''}`}
                  style={{ height: TOTAL_HEIGHT }}
                >
                  {/* Clickable 15-min slots */}
                  {HOURS.flatMap(h =>
                    [0,1,2,3].map(q => (
                      <div
                        key={`${h}-${q}`}
                        className={styles.slot}
                        style={{ top: ((h - START_HOUR) * 60 + q * 15) * HOUR_HEIGHT / 60, height: SLOT_HEIGHT }}
                        onClick={() => handleSlotClick(day, h, q)}
                      />
                    ))
                  )}

                  {/* Current time line */}
                  {isToday && (
                    <div className={styles.nowLine} style={{ top: nowTop }}>
                      <div className={styles.nowDot} />
                    </div>
                  )}

                  {/* Events */}
                  {laid.map(item => (
                    <EventBubble key={item.ev.id} item={item} onClick={onEventClick} />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
