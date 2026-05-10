import { useApp } from '../context/AppContext'
import styles from './Creators.module.css'

const AVATAR_COLORS = [
  ['#a855f7','#ec4899'], ['#38bdf8','#818cf8'], ['#f472b6','#fb923c'],
  ['#4ade80','#22d3ee'], ['#fbbf24','#f472b6'], ['#818cf8','#4ade80'],
  ['#f87171','#fbbf24'], ['#c084fc','#38bdf8'],
]

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

function localTime(tz) {
  try {
    return new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })
  } catch { return '' }
}

function shortTz(tz) {
  return tz.split('/').pop().replace(/_/g, ' ')
}

export default function Creators() {
  const { creators } = useApp()

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Creators</h1>
          <p className={styles.sub}>{creators.length} on LiveCommand</p>
        </div>

        <div className={styles.grid}>
          {creators.map((c, i) => {
            const [from, to] = AVATAR_COLORS[i % AVATAR_COLORS.length]
            return (
              <div key={c.id} className={styles.card}>
                <div className={styles.avatar} style={{ background: `linear-gradient(135deg,${from},${to})` }}>
                  {initials(c.name)}
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>{c.name}</span>
                  <span className={styles.tz}>{shortTz(c.timezone)} · {localTime(c.timezone)}</span>
                </div>
                {c.smsOptIn && <span className={styles.sms} title="SMS on">📲</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
