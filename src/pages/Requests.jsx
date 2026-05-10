import { useApp } from '../context/AppContext'
import styles from './Requests.module.css'

const AVATAR_COLORS = [
  ['#a855f7','#ec4899'], ['#38bdf8','#818cf8'], ['#f472b6','#fb923c'],
  ['#4ade80','#22d3ee'], ['#fbbf24','#f472b6'], ['#818cf8','#4ade80'],
  ['#f87171','#fbbf24'], ['#c084fc','#38bdf8'],
]

const RULE_ICONS = { gloves: '🥊', lightnings: '⚡', mist: '🌫', timers: '⏱' }

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

function formatWhen(date, time, timezone) {
  const dt = new Date(`${date}T${time}`)
  const d = new Date(date + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1)
  let day
  if (d.getTime() === today.getTime()) day = 'Today'
  else if (d.getTime() === tomorrow.getTime()) day = 'Tomorrow'
  else day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const t = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone })
  return `${day} · ${t}`
}

export default function Requests() {
  const { myInvitations, creators, respondToSeries } = useApp()

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Invites</h1>
          {myInvitations.length > 0 && (
            <span className={styles.badge}>{myInvitations.length} pending</span>
          )}
        </div>

        {myInvitations.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyLabel}>No pending invites</p>
          </div>
        ) : (
          <div className={styles.list}>
            {myInvitations.map(s => {
              const organizer = creators.find(c => c.id === s.organizerId)
              const orgIdx = creators.findIndex(c => c.id === s.organizerId)
              const [from, to] = AVATAR_COLORS[orgIdx % AVATAR_COLORS.length]
              const rules = Object.keys(RULE_ICONS).filter(k => s[k])

              return (
                <div key={s.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.orgRow}>
                      <div className={styles.orgAvatar} style={{ background: `linear-gradient(135deg,${from},${to})` }}>
                        {organizer ? initials(organizer.name) : '?'}
                      </div>
                      <div className={styles.orgInfo}>
                        <span className={styles.orgName}>{s.organizerName}</span>
                        <span className={styles.when}>{formatWhen(s.date, s.time, s.timezone)}</span>
                      </div>
                    </div>
                    <div className={styles.tags}>
                      <span className={styles.formatTag}>{s.format}</span>
                      {rules.map(k => <span key={k} className={styles.ruleIcon}>{RULE_ICONS[k]}</span>)}
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.decline} onClick={() => respondToSeries(s.id, 'declined')}>
                      Decline
                    </button>
                    <button className={styles.accept} onClick={() => respondToSeries(s.id, 'confirmed')}>
                      Accept ⚡
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
