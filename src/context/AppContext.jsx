import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

function mapProfile(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    timezone: row.timezone,
    smsOptIn: row.sms_opt_in,
  }
}

function mapSeries(row) {
  return {
    id: row.id,
    organizerId: row.organizer_id,
    organizerName: row.organizer_name,
    format: row.format,
    teams: row.teams,
    creatorIds: row.creator_ids || [],
    type: row.type,
    gloves: row.gloves,
    lightnings: row.lightnings,
    mist: row.mist,
    timers: row.timers,
    date: row.date,
    time: row.time,
    timezone: row.timezone,
    statuses: row.statuses || {},
  }
}

function mapRequest(row) {
  return {
    id: row.id,
    seriesId: row.series_id,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    status: row.status,
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [creators, setCreators] = useState([])
  const [series, setSeries] = useState([])
  const [joinRequests, setJoinRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    loadCreators()
    loadSeries()

    const seriesSub = supabase
      .channel('series-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'series' }, () => {
        loadSeries()
      })
      .subscribe()

    const requestsSub = supabase
      .channel('requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'join_requests' }, () => {
        loadJoinRequests()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(seriesSub)
      supabase.removeChannel(requestsSub)
    }
  }, [])

  useEffect(() => {
    if (user) loadJoinRequests()
  }, [user])

  async function loadProfile(authId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authId)
      .single()
    if (data) setUser(mapProfile(data))
    setLoading(false)
  }

  async function loadCreators() {
    const { data } = await supabase.from('profiles').select('id, name, email, phone, timezone, sms_opt_in')
    if (data) setCreators(data.map(mapProfile))
  }

  async function loadSeries() {
    const { data } = await supabase.from('series').select('*').order('date', { ascending: true })
    if (data) setSeries(data.map(mapSeries))
  }

  async function loadJoinRequests() {
    const { data } = await supabase.from('join_requests').select('*')
    if (data) setJoinRequests(data.map(mapRequest))
  }

  async function login({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  async function signup({ name, email, password, phone, timezone, smsOptIn }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      email,
      phone,
      timezone,
      sms_opt_in: smsOptIn,
    })
    if (profileError) return { error: profileError.message }

    await loadProfile(data.user.id)
    await loadCreators()
    return {}
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  async function createSeries({ creatorIds, format, teams, gloves, lightnings, mist, timers, type, date, time }) {
    const newSeries = {
      organizer_id: user.id,
      organizer_name: user.name,
      format,
      teams: format === '2v2' ? teams : null,
      creator_ids: creatorIds,
      type,
      gloves, lightnings, mist, timers,
      date,
      time,
      timezone: user.timezone,
      statuses: Object.fromEntries(
        creatorIds.map(id => [id, id === user.id ? 'confirmed' : 'pending'])
      ),
    }
    const { data, error } = await supabase.from('series').insert(newSeries).select().single()
    if (error) return { error: error.message }
    const mapped = mapSeries(data)
    setSeries(prev => [mapped, ...prev])
    return mapped
  }

  async function respondToSeries(seriesId, response) {
    const s = series.find(x => x.id === seriesId)
    if (!s) return
    const newStatuses = { ...s.statuses, [user.id]: response }
    const { error } = await supabase
      .from('series')
      .update({ statuses: newStatuses })
      .eq('id', seriesId)
    if (!error) {
      setSeries(prev => prev.map(x => x.id === seriesId ? { ...x, statuses: newStatuses } : x))
    }
  }

  async function joinSeries(seriesId) {
    const s = series.find(x => x.id === seriesId)
    if (!s || s.creatorIds.includes(user.id)) return
    const newCreatorIds = [...s.creatorIds, user.id]
    const newStatuses = { ...s.statuses, [user.id]: 'confirmed' }
    const { error } = await supabase
      .from('series')
      .update({ creator_ids: newCreatorIds, statuses: newStatuses })
      .eq('id', seriesId)
    if (!error) {
      setSeries(prev => prev.map(x => x.id === seriesId
        ? { ...x, creatorIds: newCreatorIds, statuses: newStatuses } : x))
    }
  }

  async function requestToJoin(seriesId) {
    if (!user) return
    const existing = joinRequests.find(r => r.seriesId === seriesId && r.requesterId === user.id)
    if (existing) return
    const { data, error } = await supabase.from('join_requests').insert({
      series_id: seriesId,
      requester_id: user.id,
      requester_name: user.name,
      status: 'pending',
    }).select().single()
    if (!error) setJoinRequests(prev => [...prev, mapRequest(data)])
  }

  async function approveRequest(seriesId, requesterId) {
    const req = joinRequests.find(r => r.seriesId === seriesId && r.requesterId === requesterId)
    if (!req) return
    await supabase.from('join_requests').update({ status: 'approved' }).eq('id', req.id)
    setJoinRequests(prev => prev.map(r =>
      r.id === req.id ? { ...r, status: 'approved' } : r
    ))
    await joinSeriesForUser(seriesId, requesterId)
  }

  async function joinSeriesForUser(seriesId, userId) {
    const s = series.find(x => x.id === seriesId)
    if (!s || s.creatorIds.includes(userId)) return
    const newCreatorIds = [...s.creatorIds, userId]
    const newStatuses = { ...s.statuses, [userId]: 'confirmed' }
    const { error } = await supabase
      .from('series')
      .update({ creator_ids: newCreatorIds, statuses: newStatuses })
      .eq('id', seriesId)
    if (!error) {
      setSeries(prev => prev.map(x => x.id === seriesId
        ? { ...x, creatorIds: newCreatorIds, statuses: newStatuses } : x))
    }
  }

  async function denyRequest(seriesId, requesterId) {
    const req = joinRequests.find(r => r.seriesId === seriesId && r.requesterId === requesterId)
    if (!req) return
    await supabase.from('join_requests').update({ status: 'denied' }).eq('id', req.id)
    setJoinRequests(prev => prev.map(r =>
      r.id === req.id ? { ...r, status: 'denied' } : r
    ))
  }

  const mySeries = series.filter(s => user && s.creatorIds.includes(user.id))
  const myInvitations = series.filter(
    s => user && s.creatorIds.includes(user.id) && s.organizerId !== user.id && s.statuses[user.id] === 'pending'
  )
  const publicSeries = series.filter(
    s => s.type === 'public' || Object.values(s.statuses).every(st => st === 'confirmed')
  )

  function getCreator(id) { return creators.find(c => c.id === id) }

  return (
    <AppContext.Provider value={{
      user, loading, login, logout, signup,
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
