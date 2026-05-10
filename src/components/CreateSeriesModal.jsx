import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import styles from './CreateSeriesModal.module.css'

const AVATAR_COLORS = [
  ['#7c3aed','#ec4899'], ['#06b6d4','#7c3aed'], ['#ec4899','#f59e0b'],
  ['#10b981','#06b6d4'], ['#f59e0b','#ec4899'], ['#6366f1','#10b981'],
  ['#ef4444','#f59e0b'], ['#8b5cf6','#06b6d4'],
]

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

const RULE_OPTIONS = [
  { key: 'gloves',     label: 'Gloves',     icon: '🥊' },
  { key: 'lightnings', label: 'Lightnings', icon: '⚡' },
  { key: 'mist',       label: 'Mist',       icon: '🌫' },
  { key: 'timers',     label: 'Timers',     icon: '⏱' },
]

export default function CreateSeriesModal({ prefill, onClose, onCreated }) {
  const { user, creators, createSeries } = useApp()

  const today = new Date().toISOString().split('T')[0]

  const [format, setFormat]     = useState('2v2')
  const [type, setType]         = useState('public')
  const [date, setDate]         = useState(prefill?.date ?? today)
  const [time, setTime]         = useState(prefill?.time ?? '20:00')
  const [rules, setRules]       = useState({ gloves: false, lightnings: false, mist: false, timers: false })
  const [search, setSearch]     = useState('')
  const [selectedIds, setSelectedIds] = useState(user ? [user.id] : [])
  const [teams, setTeams]       = useState({})
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})

  // Reset prefill when it changes
  useEffect(() => {
    if (prefill?.date) setDate(prefill.date)
    if (prefill?.time) setTime(prefill.time)
  }, [prefill?.date, prefill?.time])

  const othersSelected = selectedIds.filter(id => id !== user?.id)
  const maxOthers = 3
  const pickable = creators.filter(c => c.id !== user?.id)
  const filtered = pickable.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  function toggleCreator(id) {
    if (othersSelected.includes(id)) {
      setSelectedIds(p => p.filter(x => x !== id))
      setTeams(t => { const n = {...t}; delete n[id]; return n })
    } else if (othersSelected.length < maxOthers) {
      setSelectedIds(p => [...p, id])
    }
  }

  function toggleTeam(id) {
    setTeams(t => ({ ...t, [id]: t[id] === 'B' ? 'A' : 'B' }))
  }

  function toggleRule(key) {
    setRules(r => ({ ...r, [key]: !r[key] }))
  }

  function validate() {
    const errs = {}
    if (!date) errs.date = 'Pick a date'
    if (!time) errs.time = 'Pick a time'
    if (type === 'private' && othersSelected.length < maxOthers) {
      errs.creators = `Select ${maxOthers - othersSelected.length} more creator${maxOthers - othersSelected.length > 1 ? 's' : ''}`
    }
    if (type === 'private' && format === '2v2') {
      const tA = selectedIds.filter(id => (teams[id] ?? 'A') === 'A').length
      const tB = selectedIds.filter(id => (teams[id] ?? 'A') === 'B').length
      if (tA !== 2 || tB !== 2) errs.teams = 'Assign 2 creators to each team'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

    const builtTeams = format === '2v2' ? {
      A: selectedIds.filter(id => (teams[id] ?? 'A') === 'A'),
      B: selectedIds.filter(id => (teams[id] ?? 'A') === 'B'),
    } : null

    // For public series, only include organizer initially
    const ids = type === 'public' ? (user ? [user.id] : []) : selectedIds

    const s = createSeries({
      creatorIds: ids, format,
      teams: builtTeams,
      ...rules, type, date, time,
    })
    setLoading(false)
    onCreated?.(s)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>New Series</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Format */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Format</label>
            <div className={styles.segmented}>
              {['2v2','1v1v1v1'].map(f => (
                <button key={f} type="button"
                  className={`${styles.segBtn} ${format === f ? styles.segBtnActive : ''}`}
                  onClick={() => { setFormat(f); setTeams({}) }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Date</label>
              <input className={styles.input} type="date" min={today}
                value={date} onChange={e => { setDate(e.target.value); setErrors(er => ({...er, date: ''})) }} />
              {errors.date && <p className={styles.error}>{errors.date}</p>}
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Time</label>
              <input className={styles.input} type="time"
                value={time} onChange={e => { setTime(e.target.value); setErrors(er => ({...er, time: ''})) }} />
              {errors.time && <p className={styles.error}>{errors.time}</p>}
            </div>
          </div>

          {/* Rules */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Rules</label>
            <div className={styles.rulesGrid}>
              {RULE_OPTIONS.map(r => (
                <button key={r.key} type="button"
                  className={`${styles.ruleBtn} ${rules[r.key] ? styles.ruleBtnOn : ''}`}
                  onClick={() => toggleRule(r.key)}>
                  <span className={styles.ruleIcon}>{r.icon}</span>
                  <span className={styles.ruleLabel}>{r.label}</span>
                  <span className={styles.ruleCheck}>{rules[r.key] ? 'On' : 'Off'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Who can join</label>
            <div className={styles.typeGrid}>
              <button type="button"
                className={`${styles.typeBtn} ${type === 'public' ? styles.typeBtnActive : ''}`}
                onClick={() => setType('public')}>
                <span className={styles.typeIcon}>🌐</span>
                <span className={styles.typeName}>Public</span>
                <span className={styles.typeDesc}>Anyone can join open spots</span>
              </button>
              <button type="button"
                className={`${styles.typeBtn} ${type === 'private' ? styles.typeBtnActive : ''}`}
                onClick={() => setType('private')}>
                <span className={styles.typeIcon}>🔒</span>
                <span className={styles.typeName}>Private</span>
                <span className={styles.typeDesc}>Invite specific creators via SMS</span>
              </button>
            </div>
          </div>

          {/* Creator picker (private only) */}
          {type === 'private' && (
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Creators
                <span className={styles.fieldCount}>{othersSelected.length}/{maxOthers}</span>
              </label>

              {/* Organizer */}
              <div className={styles.organizerRow}>
                <div className={styles.avatarXs} style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                  {user ? initials(user.name) : '?'}
                </div>
                <span className={styles.organizerName}>{user?.name} <span className={styles.youTag}>(you)</span></span>
                {format === '2v2' && <span className={styles.teamTag} data-team="A">A</span>}
              </div>

              <input className={`${styles.input} ${styles.searchInput}`} type="text"
                placeholder="Search creators…" value={search}
                onChange={e => setSearch(e.target.value)} />
              {errors.creators && <p className={styles.error}>{errors.creators}</p>}

              <div className={styles.creatorList}>
                {filtered.map((c, i) => {
                  const isSelected = othersSelected.includes(c.id)
                  const isDisabled = !isSelected && othersSelected.length >= maxOthers
                  const [from, to] = AVATAR_COLORS[creators.findIndex(x => x.id === c.id) % AVATAR_COLORS.length]
                  const team = teams[c.id] ?? 'A'

                  return (
                    <div key={c.id}
                      className={`${styles.creatorRow} ${isSelected ? styles.creatorRowOn : ''} ${isDisabled ? styles.creatorRowOff : ''}`}
                      onClick={() => !isDisabled && toggleCreator(c.id)}>
                      <div className={`${styles.checkbox} ${isSelected ? styles.checkboxOn : ''}`}>
                        {isSelected && '✓'}
                      </div>
                      <div className={styles.avatarXs} style={{ background: `linear-gradient(135deg,${from},${to})` }}>
                        {initials(c.name)}
                      </div>
                      <span className={styles.creatorName}>{c.name}</span>
                      {!c.smsOptIn && <span className={styles.noSms}>No SMS</span>}
                      {isSelected && format === '2v2' && (
                        <button type="button"
                          className={`${styles.teamToggle} ${team === 'B' ? styles.teamToggleB : styles.teamToggleA}`}
                          onClick={e => { e.stopPropagation(); toggleTeam(c.id) }}>
                          {team}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              {errors.teams && <p className={styles.error}>{errors.teams}</p>}
            </div>
          )}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> :
              type === 'public' ? 'Post to Schedule →' : 'Send SMS Invites →'}
          </button>
        </form>
      </div>
    </div>
  )
}
