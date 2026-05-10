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

const MOCK_CREATORS = []

// Spread battles across today + next 6 days
const D = (offset, time) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return { date: d.toISOString().split('T')[0], time }
}

const MOCK_SERIES = []

const MOCK_USER = null

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
