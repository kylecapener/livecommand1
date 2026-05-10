import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import SeriesDetailModal from '../components/SeriesDetailModal'
import { formatTime, browserTimezone } from '../utils/time'
import styles from './Schedule.module.css'

const AVATAR_COLORS = [
  ['#a855f7','#ec4899'], ['#38bdf8','#818cf8'], ['#f472b6','#fb923c'],
  ['#4ade80','#22d3ee'], ['#fbbf24','#f472b6'], ['#818cf8','#4ade80'],
  ['#f87171','#fbbf24'], ['#c084fc','#38bdf8'],
]

const RULE_ICONS = { gloves: '🥊', lightnings: '⚡', mist: '🌫', timers: '⏱' }

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function formatDayHeader(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1)
  const d = new Date(dateStr + 'T00:00:00')
  if (d.getTime() === today.getTime()) return 'Today'
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatWeekDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

function CreatorPill({ name, i, status }) {
  const [from, to] = AVATAR_COLORS[i % AVATAR_COLORS.length]
  return (
    <div
      className={`${styles.creatorPill} ${status === 'confirmed' ? styles.pillConfirmed : ''}`}
      style={{ background: `linear-gradient(135deg,${from},${to})` }}
    >
      {name.split(' ')[0]}
    </div>
  )
}

function WeekPill({ name, i }) {
  const [from, to] = AVATAR_COLORS[i % AVATAR_COLORS.length]
  return (
    <div className={styles.weekPill} style={{ background: `linear-gradient(135deg,${from},${to})` }}>
      {name.split(' ')[0]}
    </div>
  )
}

function TodayCard({ series, creators, onClick, viewerTz }) {
  const rules = Object.keys(RULE_ICONS).filter(k => series[k])
  const timeStr = formatTime(series.date, series.time, series.timezone, viewerTz)
  const allConfirmed = Object.values(series.statuses).every(s => s === 'confirmed')

  const renderCreators = () => {
    if (series.format === '2v2' && series.teams) {
      const teamA = series.teams.A.map(id => ({ id, creator: creators.find(c => c.id === id), idx: series.creatorIds.indexOf(id) }))
      const teamB = series.teams.B.map(id => ({ id, creator: creators.find(c => c.id === id), idx: series.creatorIds.indexOf(id) }))
      return (
        <div className={styles.teamsRow}>
          <div className={styles.teamSide}>
            {teamA.map(({ id, creator, idx }) => creator ? (
              <CreatorPill key={id} name={creator.name} i={idx} status={series.statuses[id]} />
            ) : null)}
          </div>
          <div className={styles.vsLabel}>vs</div>
          <div className={styles.teamSide}>
            {teamB.map(({ id, creator, idx }) => creator ? (
              <CreatorPill key={id} name={creator.name} i={idx} status={series.statuses[id]} />
            ) : null)}
          </div>
        </div>
      )
    }
    return (
      <div className={styles.ffaRow}>
        {series.creatorIds.map((id, i) => {
          const c = creators.find(x => x.id === id)
          return c ? <CreatorPill key={id} name={c.name} i={i} status={series.statuses[id]} /> : null
        })}
      </div>
    )
  }

  return (
    <div
      className={`${styles.todayCard} ${allConfirmed ? styles.todayCardConfirmed : ''}`}
      onClick={() => onClick(series)}
    >
      <div className={styles.todayCardTop}>
        <span className={styles.todayTime}>{timeStr}</span>
        <div className={styles.todayMeta}>
          {rules.map(k => <span key={k} className={styles.ruleIcon}>{RULE_ICONS[k]}</span>)}
          <span className={styles.formatTag}>{series.format}</span>
          <span className={styles.typeTag}>{series.type === 'public' ? '🌐' : '🔒'}</span>
        </div>
      </div>
      {renderCreators()}
    </div>
  )
}

function WeekCard({ series, creators, onClick, viewerTz }) {
  const timeStr = formatTime(series.date, series.time, series.timezone, viewerTz)
  const rules = Object.keys(RULE_ICONS).filter(k => series[k])

  return (
    <div className={styles.weekCard} onClick={() => onClick(series)}>
      <div className={styles.weekCardTime}>{timeStr}</div>
      <div className={styles.weekPills}>
        {series.creatorIds.slice(0,4).map((id, i) => {
          const c = creators.find(x => x.id === id)
          return c ? <WeekPill key={id} name={c.name} i={i} /> : null
        })}
      </div>
      <div className={styles.weekCardMeta}>
        <span className={styles.weekFormat}>{series.format}</span>
        {rules.length > 0 && <span className={styles.weekRules}>{rules.map(k => RULE_ICONS[k]).join('')}</span>}
      </div>
    </div>
  )
}

function OpenPill({ name, i }) {
  const [from, to] = AVATAR_COLORS[i % AVATAR_COLORS.length]
  return (
    <div className={styles.openPill} style={{ background: `linear-gradient(135deg,${from},${to})` }}>
      {name.split(' ')[0]}
    </div>
  )
}

function OpenSeriesCard({ series, creators, user, joinRequests, onRequestJoin, onClick, viewerTz }) {
  const timeStr = formatTime(series.date, series.time, series.timezone, viewerTz)
  const rules = Object.keys(RULE_ICONS).filter(k => series[k])
  const organizer = creators.find(c => c.id === series.organizerId)
  const alreadyIn = user && series.creatorIds.includes(user.id)
  const myRequest = user && joinRequests.find(r => r.seriesId === series.id && r.requesterId === user.id)

  let btnLabel = 'Request to Join'
  let btnClass = styles.openJoinBtn
  let btnDisabled = false
  if (!user) {
    btnLabel = 'Sign in to Join'
    btnClass = `${styles.openJoinBtn} ${styles.openJoinBtnGuest}`
    btnDisabled = true
  } else if (alreadyIn) {
    btnLabel = 'In Battle'
    btnClass = `${styles.openJoinBtn} ${styles.openJoinBtnIn}`
    btnDisabled = true
  } else if (myRequest?.status === 'pending') {
    btnLabel = 'Requested'
    btnClass = `${styles.openJoinBtn} ${styles.openJoinBtnPending}`
    btnDisabled = true
  } else if (myRequest?.status === 'approved') {
    btnLabel = 'Joined'
    btnClass = `${styles.openJoinBtn} ${styles.openJoinBtnIn}`
    btnDisabled = true
  } else if (myRequest?.status === 'denied') {
    btnLabel = 'Denied'
    btnClass = `${styles.openJoinBtn} ${styles.openJoinBtnDenied}`
    btnDisabled = true
  }

  return (
    <div className={styles.openCard} onClick={() => onClick(series)}>
      <div className={styles.openCardTop}>
        <div className={styles.openCardLeft}>
          <span className={styles.openTime}>{timeStr}</span>
          <div className={styles.openOrgRow}>
            <span className={styles.openOrgLabel}>by</span>
            <span className={styles.openOrgName}>{organizer?.name ?? 'Unknown'}</span>
          </div>
        </div>
        <div className={styles.openCardRight}>
          {rules.map(k => <span key={k} className={styles.ruleIcon}>{RULE_ICONS[k]}</span>)}
          <span className={styles.formatTag}>{series.format}</span>
        </div>
      </div>
      <div className={styles.openPillsRow}>
        {series.creatorIds.map((id, i) => {
          const c = creators.find(x => x.id === id)
          return c ? <OpenPill key={id} name={c.name} i={i} /> : null
        })}
      </div>
      <div className={styles.openCardFooter} onClick={e => e.stopPropagation()}>
        <span className={styles.openSpots}>{series.creatorIds.length} joined · Open</span>
        <button
          className={btnClass}
          disabled={btnDisabled}
          onClick={() => !btnDisabled && onRequestJoin(series.id)}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  )
}

export default function Schedule() {
  const { publicSeries, creators, user, joinRequests, requestToJoin } = useApp()
  const [detail, setDetail] = useState(null)
  const [dayOffset, setDayOffset] = useState(0)
  const [tab, setTab] = useState('all')

  const viewerTz = user?.timezone || browserTimezone()

  const baseDate = new Date()
  baseDate.setHours(0,0,0,0)
  baseDate.setDate(baseDate.getDate() + dayOffset)
  const viewDateStr = toDateStr(baseDate)

  const allUpcoming = publicSeries
    .filter(s => new Date(`${s.date}T${s.time}`) >= new Date(Date.now() - 3600000))
    .sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  const todayEvents = allUpcoming.filter(s => s.date === viewDateStr)

  const weekEvents = allUpcoming.filter(s => {
    const d = new Date(s.date + 'T00:00:00')
    const base = new Date(baseDate)
    const diff = Math.round((d - base) / 86400000)
    return diff > 0 && diff <= 6
  })

  const weekGrouped = {}
  for (const s of weekEvents) {
    if (!weekGrouped[s.date]) weekGrouped[s.date] = []
    weekGrouped[s.date].push(s)
  }
  const weekDates = Object.keys(weekGrouped).sort()

  // Open series: public, user not already in, today's view
  const openSeries = allUpcoming.filter(s =>
    s.date === viewDateStr &&
    s.type === 'public' &&
    !(user && s.creatorIds.includes(user.id))
  )

  const isToday = dayOffset === 0
  const dateLabel = isToday
    ? `Today · ${baseDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
    : formatDayHeader(viewDateStr)

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Day navigation */}
        <div className={styles.dayNav}>
          <div className={styles.dayNavLeft}>
            <button className={styles.navArrow} onClick={() => setDayOffset(o => o - 1)}>‹</button>
            <button className={styles.navArrow} onClick={() => setDayOffset(o => o + 1)}>›</button>
            {!isToday && (
              <button className={styles.todayReset} onClick={() => setDayOffset(0)}>Today</button>
            )}
            <h2 className={styles.dayLabel}>{dateLabel}</h2>
          </div>
          {!user && (
            <Link to="/login" className={styles.signInCta}>Sign in to create ⚡</Link>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'all' ? styles.tabOn : ''}`} onClick={() => setTab('all')}>
            All Battles
            {todayEvents.length > 0 && <span className={styles.tabCount}>{todayEvents.length}</span>}
          </button>
          <button className={`${styles.tab} ${tab === 'open' ? styles.tabOn : ''}`} onClick={() => setTab('open')}>
            Open Series
            {openSeries.length > 0 && <span className={styles.tabCount}>{openSeries.length}</span>}
          </button>
        </div>

        {tab === 'all' && (
          <>
            {todayEvents.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyLabel}>No battles scheduled</p>
                {user && <p className={styles.emptyHint}>Create one with + New Battle above</p>}
              </div>
            ) : (
              <div className={styles.todayCards}>
                {todayEvents.map(s => (
                  <TodayCard key={s.id} series={s} creators={creators} onClick={setDetail} viewerTz={viewerTz} />
                ))}
              </div>
            )}

            {weekDates.length > 0 && (
              <div className={styles.weekSection}>
                <div className={styles.weekHeader}>
                  <span className={styles.weekLabel}>This Week</span>
                  <div className={styles.weekDivider} />
                </div>
                <div className={styles.weekGroups}>
                  {weekDates.map(dateStr => {
                    const { day, date } = formatWeekDay(dateStr)
                    return (
                      <div key={dateStr} className={styles.weekGroup}>
                        <div className={styles.weekDayHeader}>
                          <span className={styles.weekDayName}>{day}</span>
                          <span className={styles.weekDayDate}>{date}</span>
                        </div>
                        <div className={styles.weekCards}>
                          {weekGrouped[dateStr].map(s => (
                            <WeekCard key={s.id} series={s} creators={creators} onClick={setDetail} viewerTz={viewerTz} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'open' && (
          openSeries.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyLabel}>No open series today</p>
              {!user && <p className={styles.emptyHint}><Link to="/login" className={styles.signInLink}>Sign in</Link> to request to join</p>}
            </div>
          ) : (
            <div className={styles.openCards}>
              {openSeries.map(s => (
                <OpenSeriesCard
                  key={s.id}
                  series={s}
                  creators={creators}
                  user={user}
                  joinRequests={joinRequests || []}
                  onRequestJoin={requestToJoin}
                  onClick={setDetail}
                  viewerTz={viewerTz}
                />
              ))}
            </div>
          )
        )}
      </div>

      {detail && (
        <SeriesDetailModal
          series={detail}
          onClose={() => setDetail(null)}
          onJoin={() => setDetail(null)}
        />
      )}
    </div>
  )
}
