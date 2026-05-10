import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export const TIMEZONES = [
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Hawaii (HT)', value: 'Pacific/Honolulu' },
  { label: 'Alaska (AKT)', value: 'America/Anchorage' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Paris / Berlin (CET)', value: 'Europe/Paris' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
]

const PRIVATE_PHONES = {
  c1: '+15550001111', c2: '+15550002222', c3: '+15550003333',
  c4: '+15550004444', c5: '+15550005555', c6: '+15550006666',
  c7: '+15550007777', c8: '+15550008888',
}

const MOCK_CREATORS = [
  { id: 'c1', name: 'Kai Rivers',  timezone: 'America/New_York',   smsOptIn: true  },
  { id: 'c2', name: 'Nova Chen',   timezone: 'America/Los_Angeles', smsOptIn: true  },
  { id: 'c3', name: 'Zara Mills',  timezone: 'America/Chicago',     smsOptIn: true  },
  { id: 'c4', name: 'Marcus T.',   timezone: 'America/New_York',    smsOptIn: false },
  { id: 'c5', name: 'Sol Reyes',   timezone: 'America/Denver',      smsOptIn: true  },
  { id: 'c6', name: 'Echo Jam',    timezone: 'America/Los_Angeles', smsOptIn: true  },
  { id: 'c7', name: 'Pixel Panda', timezone: 'Europe/London',       smsOptIn: true  },
  { id: 'c8', name: 'Vibe Lord',   timezone: 'America/Chicago',     smsOptIn: true  },
]

// Spread battles across today + next 6 days
const D = (offset, time) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return { date: d.toISOString().split('T')[0], time }
}

const MOCK_SERIES = [
  {
    id: 's1', organizerId: 'c1', organizerName: 'Kai Rivers',
    format: '2v2', teams: { A: ['c1','c3'], B: ['c2','c4'] },
    creatorIds: ['c1','c2','c3','c4'], type: 'private',
    gloves: true, lightnings: false, mist: true, timers: true,
    ...D(0, '20:00'), timezone: 'America/New_York',
    statuses: { c1: 'confirmed', c2: 'confirmed', c3: 'pending', c4: 'declined' },
  },
  {
    id: 's2', organizerId: 'c2', organizerName: 'Nova Chen',
    format: '1v1v1v1', teams: null,
    creatorIds: ['c1','c2','c5','c6'], type: 'public',
    gloves: false, lightnings: true, mist: false, timers: false,
    ...D(0, '14:00'), timezone: 'America/Los_Angeles',
    statuses: { c1: 'confirmed', c2: 'confirmed', c5: 'confirmed', c6: 'confirmed' },
  },
  {
    id: 's3', organizerId: 'c7', organizerName: 'Pixel Panda',
    format: '2v2', teams: { A: ['c7','c5'], B: ['c3','c8'] },
    creatorIds: ['c7','c5','c3','c8'], type: 'public',
    gloves: true, lightnings: true, mist: false, timers: true,
    ...D(1, '19:00'), timezone: 'Europe/London',
    statuses: { c7: 'confirmed', c5: 'confirmed', c3: 'confirmed', c8: 'confirmed' },
  },
  {
    id: 's4', organizerId: 'c5', organizerName: 'Sol Reyes',
    format: '1v1v1v1', teams: null,
    creatorIds: ['c1','c5','c6','c8'], type: 'public',
    gloves: false, lightnings: false, mist: true, timers: true,
    ...D(1, '21:00'), timezone: 'America/Denver',
    statuses: { c1: 'pending', c5: 'confirmed', c6: 'confirmed', c8: 'pending' },
  },
  {
    id: 's5', organizerId: 'c3', organizerName: 'Zara Mills',
    format: '2v2', teams: { A: ['c3','c1'], B: ['c6','c7'] },
    creatorIds: ['c3','c1','c6','c7'], type: 'private',
    gloves: true, lightnings: false, mist: false, timers: false,
    ...D(2, '18:00'), timezone: 'America/Chicago',
    statuses: { c3: 'confirmed', c1: 'confirmed', c6: 'pending', c7: 'pending' },
  },
  {
    id: 's6', organizerId: 'c6', organizerName: 'Echo Jam',
    format: '2v2', teams: { A: ['c6','c2'], B: ['c4','c8'] },
    creatorIds: ['c6','c2','c4','c8'], type: 'public',
    gloves: false, lightnings: true, mist: true, timers: false,
    ...D(3, '20:30'), timezone: 'America/Los_Angeles',
    statuses: { c6: 'confirmed', c2: 'confirmed', c4: 'confirmed', c8: 'confirmed' },
  },
  {
    id: 's7', organizerId: 'c1', organizerName: 'Kai Rivers',
    format: '1v1v1v1', teams: null,
    creatorIds: ['c1','c3','c5','c7'], type: 'private',
    gloves: true, lightnings: true, mist: true, timers: true,
    ...D(4, '21:00'), timezone: 'America/New_York',
    statuses: { c1: 'confirmed', c3: 'confirmed', c5: 'pending', c7: 'confirmed' },
  },
  {
    id: 's8', organizerId: 'c8', organizerName: 'Vibe Lord',
    format: '2v2', teams: { A: ['c8','c4'], B: ['c2','c5'] },
    creatorIds: ['c8','c4','c2','c5'], type: 'public',
    gloves: false, lightnings: false, mist: false, timers: true,
    ...D(5, '17:30'), timezone: 'America/Chicago',
    statuses: { c8: 'confirmed', c4: 'confirmed', c2: 'confirmed', c5: 'confirmed' },
  },
  {
    id: 's9', organizerId: 'c2', organizerName: 'Nova Chen',
    format: '2v2', teams: { A: ['c2','c6'], B: ['c1','c3'] },
    creatorIds: ['c2','c6','c1','c3'], type: 'public',
    gloves: true, lightnings: false, mist: false, timers: true,
    ...D(6, '20:00'), timezone: 'America/Los_Angeles',
    statuses: { c2: 'confirmed', c6: 'confirmed', c1: 'pending', c3: 'pending' },
  },
]

const MOCK_USER = { id: 'c1', name: 'Kai Rivers', timezone: 'America/New_York', smsOptIn: true }

export function buildSmsMessage(organizerName, date, time, timezone, format, gloves, lightnings, mist, timers) {
  const dt = new Date(`${date}T${time}:00`)
  const friendlyTime = dt.toLocaleTimeString('en-US', {
    timeZone: timezone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
  const rules = [
    gloves && 'Gloves', lightnings && 'Lightnings', mist && 'Mist', timers && 'Timers',
  ].filter(Boolean).join(', ') || 'No rules'
  return `Do you want to be in ${organizerName}'s series at ${friendlyTime}? Format: ${format}. Rules: ${rules}. Reply YES or NO.`
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [creators, setCreators] = useState(MOCK_CREATORS)
  const [series, setSeries] = useState(MOCK_SERIES)
  const [joinRequests, setJoinRequests] = useState([])

  function login({ email, password }) {
    // Mock: accept any valid-looking credentials
    setUser(MOCK_USER)
    return {}
  }

  function signup({ name, email, password, phone, timezone, smsOptIn }) {
    const newCreator = { id: `c${Date.now()}`, name, email, phone, timezone, smsOptIn }
    setCreators(prev => [...prev, newCreator])
    setUser({ id: newCreator.id, name, email, phone, timezone, smsOptIn })
    return newCreator
  }

  function logout() { setUser(null) }

  function createSeries({ creatorIds, format, teams, gloves, lightnings, mist, timers, type, date, time }) {
    const newSeries = {
      id: `s${Date.now()}`,
      organizerId: user.id,
      organizerName: user.name,
      format,
      teams: format === '2v2' ? teams : null,
      creatorIds,
      type,
      gloves, lightnings, mist, timers,
      date,
      time,
      timezone: user.timezone,
      statuses: Object.fromEntries(
        creatorIds.map(id => [id, id === user.id ? 'confirmed' : 'pending'])
      ),
    }
    setSeries(prev => [newSeries, ...prev])
    return newSeries
  }

  function respondToSeries(seriesId, response) {
    setSeries(prev =>
      prev.map(s => s.id === seriesId
        ? { ...s, statuses: { ...s.statuses, [user.id]: response } }
        : s
      )
    )
  }

  function joinSeries(seriesId) {
    setSeries(prev =>
      prev.map(s => {
        if (s.id !== seriesId || s.creatorIds.includes(user.id)) return s
        return {
          ...s,
          creatorIds: [...s.creatorIds, user.id],
          statuses: { ...s.statuses, [user.id]: 'confirmed' },
        }
      })
    )
  }

  function requestToJoin(seriesId) {
    if (!user) return
    setJoinRequests(prev => {
      if (prev.find(r => r.seriesId === seriesId && r.requesterId === user.id)) return prev
      return [...prev, { seriesId, requesterId: user.id, requesterName: user.name, status: 'pending' }]
    })
  }

  function approveRequest(seriesId, requesterId) {
    setJoinRequests(prev =>
      prev.map(r => r.seriesId === seriesId && r.requesterId === requesterId
        ? { ...r, status: 'approved' } : r
      )
    )
    setSeries(prev =>
      prev.map(s => {
        if (s.id !== seriesId || s.creatorIds.includes(requesterId)) return s
        return {
          ...s,
          creatorIds: [...s.creatorIds, requesterId],
          statuses: { ...s.statuses, [requesterId]: 'confirmed' },
        }
      })
    )
  }

  function denyRequest(seriesId, requesterId) {
    setJoinRequests(prev =>
      prev.map(r => r.seriesId === seriesId && r.requesterId === requesterId
        ? { ...r, status: 'denied' } : r
      )
    )
  }

  const mySeries = series.filter(s => user && s.creatorIds.includes(user.id))
  const myInvitations = series.filter(
    s => user && s.creatorIds.includes(user.id) && s.organizerId !== user.id && s.statuses[user.id] === 'pending'
  )
  // Public on calendar: all confirmed private series + all public series
  const publicSeries = series.filter(
    s => s.type === 'public' || Object.values(s.statuses).every(st => st === 'confirmed')
  )

  function getCreator(id) { return creators.find(c => c.id === id) }

  return (
    <AppContext.Provider value={{
      user, login, logout, signup,
      creators, getCreator,
      series, mySeries, myInvitations, publicSeries,
      joinRequests,
      createSeries, respondToSeries, joinSeries,
      requestToJoin, approveRequest, denyRequest,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() { return useContext(AppContext) }
