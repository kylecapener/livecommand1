import { useApp } from '../context/AppContext'
import styles from './SeriesDetailModal.module.css'

const AVATAR_COLORS = [
  ['#7c3aed','#ec4899'], ['#06b6d4','#7c3aed'], ['#ec4899','#f59e0b'],
  ['#10b981','#06b6d4'], ['#f59e0b','#ec4899'], ['#6366f1','#10b981'],
  ['#ef4444','#f59e0b'], ['#8b5cf6','#06b6d4'],
]

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

const RULES = [
  { key: 'gloves',     label: 'Gloves',     icon: '🥊' },
  { key: 'lightnings', label: 'Lightnings', icon: '⚡' },
  { key: 'mist',       label: 'Mist',       icon: '🌫' },
  { key: 'timers',     label: 'Timers',     icon: '⏱' },
]

const STATUS_META = {
  confirmed: { label: 'Confirmed', cls: 'confirmed', icon: '✓' },
  pending:   { label: 'Pending',   cls: 'pending',   icon: '…' },
  declined:  { label: 'Declined',  cls: 'declined',  icon: '✕' },
}

export default function SeriesDetailModal({ series, onClose, onJoin }) {
  const { user, creators, respondToSeries, joinSeries } = useApp()
  if (!series) return null

  const dt = new Date(`${series.date}T${series.time}`)
  const friendlyDate = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const friendlyTime = dt.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: series.timezone,
  })

  const activeRules = RULES.filter(r => series[r.key])
  const isOrganizer = user?.id === series.organizerId
  const myStatus = user ? series.statuses[user.id] : null
  const isInvited = !!myStatus
  const isMember  = series.creatorIds.includes(user?.id)

  const canJoin = user && series.type === 'public' && !isMember

  function handleAccept()  { respondToSeries(series.id, 'confirmed'); onClose() }
  function handleDecline() { respondToSeries(series.id, 'declined');  onClose() }
  function handleJoin()    { joinSeries(series.id); onJoin?.(); onClose() }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerMeta}>
            <span className={styles.formatBadge}>{series.format}</span>
            <span className={`${styles.typeBadge} ${series.type === 'public' ? styles.typeBadgePublic : styles.typeBadgePrivate}`}>
              {series.type === 'public' ? '🌐 Public' : '🔒 Private'}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          {/* Date/time */}
          <div className={styles.datetime}>
            <span className={styles.dateText}>{friendlyDate}</span>
            <span className={styles.timeText}>{friendlyTime}</span>
          </div>

          <p className={styles.organizer}>
            by <strong>{series.organizerName}</strong>
          </p>

          {/* Rules */}
          <div className={styles.rulesRow}>
            {activeRules.length > 0 ? (
              activeRules.map(r => (
                <span key={r.key} className={styles.rulePill}>
                  {r.icon} {r.label}
                </span>
              ))
            ) : (
              <span className={styles.noRules}>No special rules</span>
            )}
          </div>

          <div className={styles.divider} />

          {/* Creator lineup */}
          {series.format === '2v2' && series.teams ? (
            <div className={styles.teams}>
              {(['A','B']).map(team => (
                <div key={team} className={styles.teamBlock}>
                  <div className={styles.teamLabel} data-team={team}>Team {team}</div>
                  {series.teams[team].map((id, i) => {
                    const c = creators.find(x => x.id === id)
                    const status = series.statuses[id] ?? 'pending'
                    const meta = STATUS_META[status]
                    const [from, to] = AVATAR_COLORS[series.creatorIds.indexOf(id) % AVATAR_COLORS.length]
                    return c ? (
                      <div key={id} className={styles.creatorRow}>
                        <div className={styles.avatar} style={{ background: `linear-gradient(135deg,${from},${to})` }}>
                          {initials(c.name)}
                        </div>
                        <span className={styles.creatorName}>{c.name}</span>
                        <span className={`${styles.statusBadge} ${styles[meta.cls]}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </div>
                    ) : null
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.ffaList}>
              {series.creatorIds.map((id, i) => {
                const c = creators.find(x => x.id === id)
                const status = series.statuses[id] ?? 'pending'
                const meta = STATUS_META[status]
                const [from, to] = AVATAR_COLORS[i % AVATAR_COLORS.length]
                return c ? (
                  <div key={id} className={styles.creatorRow}>
                    <div className={styles.avatar} style={{ background: `linear-gradient(135deg,${from},${to})` }}>
                      {initials(c.name)}
                    </div>
                    <span className={styles.creatorName}>{c.name}</span>
                    <span className={`${styles.statusBadge} ${styles[meta.cls]}`}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                ) : null
              })}
            </div>
          )}

          {/* Actions */}
          {canJoin && (
            <button className={styles.joinBtn} onClick={handleJoin}>
              Join this battle ⚡
            </button>
          )}

          {isInvited && myStatus === 'pending' && !isOrganizer && (
            <div className={styles.respondRow}>
              <button className={styles.declineBtn} onClick={handleDecline}>Decline</button>
              <button className={styles.acceptBtn} onClick={handleAccept}>Accept ⚡</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
