import { useState } from 'react'
import { useApp } from '../context/AppContext'
import SeriesDetailModal from '../components/SeriesDetailModal'
import { formatTime, browserTimezone } from '../utils/time'
import styles from './Dashboard.module.css'

const AVATAR_COLORS = [
  ['#a855f7','#ec4899'], ['#38bdf8','#818cf8'], ['#f472b6','#fb923c'],
  ['#4ade80','#22d3ee'], ['#fbbf24','#f472b6'], ['#818cf8','#4ade80'],
  ['#f87171','#fbbf24'], ['#c084fc','#38bdf8'],
]

const RULE_ICONS = { gloves: '🥊', lightnings: '⚡', mist: '🌫', timers: '⏱' }

const STATUS = {
  confirmed: { color: '#16a34a', label: '✓' },
  pending:   { color: '#d97706', label: '·' },
  declined:  { color: '#dc2626', label: '✕' },
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function formatDateLabel(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((d - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function Pill({ id, idx, series, creators }) {
  const c = creators.find(x => x.id === id)
  if (!c) return null
  const [from, to] = AVATAR_COLORS[idx % AVATAR_COLORS.length]
  const status = series.statuses[id] ?? 'pending'
  return (
    <div
      className={styles.pill}
      style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 0 0 2px ${STATUS[status].color}55` }}
    >
      {c.name.split(' ')[0]}
      <span className={styles.pillStatus} style={{ color: STATUS[status].color }}>
        {STATUS[status].label}
      </span>
    </div>
  )
}

function TodayCard({ series, creators, user, onClick, pendingRequests, onApprove, onDeny, viewerTz }) {
  const timeStr = formatTime(series.date, series.time, series.timezone, viewerTz)
  const rules = Object.keys(RULE_ICONS).filter(k => series[k])
  const isOrg = series.organizerId === user.id
  const allConfirmed = Object.values(series.statuses).every(s => s === 'confirmed')

  const renderCreators = () => {
    if (series.format === '2v2' && series.teams) {
      return (
        <div className={styles.teamsRow}>
          <div className={styles.teamSide}>
            {series.teams.A.map(id => <Pill key={id} id={id} idx={series.creatorIds.indexOf(id)} series={series} creators={creators} />)}
          </div>
          <div className={styles.vs}>vs</div>
          <div className={styles.teamSide}>
            {series.teams.B.map(id => <Pill key={id} id={id} idx={series.creatorIds.indexOf(id)} series={series} creators={creators} />)}
          </div>
        </div>
      )
    }
    return (
      <div className={styles.ffaRow}>
        {series.creatorIds.map((id, i) => <Pill key={id} id={id} idx={i} series={series} creators={creators} />)}
      </div>
    )
  }

  return (
    <div className={`${styles.todayCard} ${allConfirmed ? styles.todayCardConfirmed : ''}`} onClick={() => onClick(series)}>
      <div className={styles.todayTop}>
        <span className={styles.todayTime}>{timeStr}</span>
        <div className={styles.todayMeta}>
          {isOrg && <span className={styles.orgTag}>Organizer</span>}
          {rules.map(k => <span key={k} className={styles.ruleIcon}>{RULE_ICONS[k]}</span>)}
          <span className={styles.formatTag}>{series.format}</span>
        </div>
      </div>
      {renderCreators()}
      {isOrg && pendingRequests.length > 0 && (
        <div className={styles.requestsSection} onClick={e => e.stopPropagation()}>
          <div className={styles.requestsLabel}>Join Requests</div>
          {pendingRequests.map(req => (
            <div key={req.requesterId} className={styles.requestRow}>
              <span className={styles.requesterName}>{req.requesterName}</span>
              <div className={styles.requestActions}>
                <button className={styles.approveBtn} onClick={() => onApprove(series.id, req.requesterId)}>Approve</button>
                <button className={styles.denyBtn} onClick={() => onDeny(series.id, req.requesterId)}>Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InviteCard({ series, creators, user, onAccept, onDecline, onClick, viewerTz }) {
  const timeStr = formatTime(series.date, series.time, series.timezone, viewerTz)
  const rules = Object.keys(RULE_ICONS).filter(k => series[k])
  const dateLabel = formatDateLabel(series.date)

  const renderCreators = () => {
    if (series.format === '2v2' && series.teams) {
      return (
        <div className={styles.teamsRow}>
          <div className={styles.teamSide}>
            {series.teams.A.map(id => <Pill key={id} id={id} idx={series.creatorIds.indexOf(id)} series={series} creators={creators} />)}
          </div>
          <div className={styles.vs}>vs</div>
          <div className={styles.teamSide}>
            {series.teams.B.map(id => <Pill key={id} id={id} idx={series.creatorIds.indexOf(id)} series={series} creators={creators} />)}
          </div>
        </div>
      )
    }
    return (
      <div className={styles.ffaRow}>
        {series.creatorIds.map((id, i) => <Pill key={id} id={id} idx={i} series={series} creators={creators} />)}
      </div>
    )
  }

  return (
    <div className={styles.inviteCard} onClick={() => onClick(series)}>
      <div className={styles.inviteTop}>
        <div className={styles.inviteTimeBlock}>
          <span className={styles.inviteDateLabel}>{dateLabel}</span>
          <span className={styles.inviteTime}>{timeStr}</span>
        </div>
        <div className={styles.todayMeta}>
          {rules.map(k => <span key={k} className={styles.ruleIcon}>{RULE_ICONS[k]}</span>)}
          <span className={styles.formatTag}>{series.format}</span>
        </div>
      </div>
      <p className={styles.inviteBy}>Invited by <strong>{series.organizerName}</strong></p>
      {renderCreators()}
      <div className={styles.inviteActions} onClick={e => e.stopPropagation()}>
        <button className={styles.declineBtn} onClick={() => onDecline(series.id)}>Decline</button>
        <button className={styles.acceptBtn} onClick={() => onAccept(series.id)}>Accept ⚡</button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, mySeries, myInvitations, creators, joinRequests, respondToSeries, approveRequest, denyRequest } = useApp()
  const [detail, setDetail] = useState(null)
  const [tab, setTab] = useState('today')

  const viewerTz = user?.timezone || browserTimezone()
  const todayStr = toDateStr(new Date())
  const cutoff = new Date(Date.now() - 3600000)

  const todayBattles = mySeries
    .filter(s => s.date === todayStr && new Date(`${s.date}T${s.time}`) >= cutoff && s.statuses[user.id] !== 'pending')
    .sort((a,b) => a.time.localeCompare(b.time))

  const pendingInvites = myInvitations
    .filter(s => new Date(`${s.date}T${s.time}`) >= cutoff)
    .sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  const past = mySeries
    .filter(s => new Date(`${s.date}T${s.time}`) < cutoff)
    .sort((a,b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))

  function getPendingRequests(seriesId) {
    return joinRequests.filter(r => r.seriesId === seriesId && r.status === 'pending')
  }

  // Auto-switch to invites tab if no today battles but there are invites
  const defaultTab = pendingInvites.length > 0 && todayBattles.length === 0 ? 'invites' : 'today'
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Battles</h1>
          <p className={styles.sub}>Welcome back, {user.name}</p>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'today' ? styles.tabOn : ''}`} onClick={() => setActiveTab('today')}>
            Today's Battles
            {todayBattles.length > 0 && <span className={styles.count}>{todayBattles.length}</span>}
          </button>
          <button className={`${styles.tab} ${activeTab === 'invites' ? styles.tabOn : ''}`} onClick={() => setActiveTab('invites')}>
            Invites
            {pendingInvites.length > 0 && <span className={`${styles.count} ${styles.countAmber}`}>{pendingInvites.length}</span>}
          </button>
          <button className={`${styles.tab} ${activeTab === 'past' ? styles.tabOn : ''}`} onClick={() => setActiveTab('past')}>
            Past
          </button>
        </div>

        {activeTab === 'today' && (
          todayBattles.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyLabel}>No battles today</p>
              {pendingInvites.length > 0 && (
                <button className={styles.emptyAction} onClick={() => setActiveTab('invites')}>
                  View {pendingInvites.length} pending invite{pendingInvites.length > 1 ? 's' : ''} →
                </button>
              )}
            </div>
          ) : (
            <div className={styles.todayCards}>
              {todayBattles.map(s => (
                <TodayCard
                  key={s.id}
                  series={s}
                  creators={creators}
                  user={user}
                  onClick={setDetail}
                  pendingRequests={getPendingRequests(s.id)}
                  onApprove={approveRequest}
                  onDeny={denyRequest}
                  viewerTz={viewerTz}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'invites' && (
          pendingInvites.length === 0 ? (
            <div className={styles.empty}><p className={styles.emptyLabel}>No pending invites</p></div>
          ) : (
            <div className={styles.todayCards}>
              {pendingInvites.map(s => (
                <InviteCard
                  key={s.id}
                  series={s}
                  creators={creators}
                  user={user}
                  onAccept={id => respondToSeries(id, 'confirmed')}
                  onDecline={id => respondToSeries(id, 'declined')}
                  onClick={setDetail}
                  viewerTz={viewerTz}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'past' && (
          past.length === 0 ? (
            <div className={styles.empty}><p className={styles.emptyLabel}>No past battles</p></div>
          ) : (
            <div className={styles.todayCards}>
              {past.map(s => (
                <TodayCard key={s.id} series={s} creators={creators} user={user} onClick={setDetail} pendingRequests={[]} onApprove={() => {}} onDeny={() => {}} viewerTz={viewerTz} />
              ))}
            </div>
          )
        )}
      </div>

      {detail && (
        <SeriesDetailModal series={detail} onClose={() => setDetail(null)} onJoin={() => setDetail(null)} />
      )}
    </div>
  )
}
