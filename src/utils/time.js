// Convert a naive date+time stored in `seriesTimezone` and display it in `viewerTimezone`.
// e.g. "2026-05-10" + "20:00" in "America/New_York" → shown as "5:00 PM" for a PT viewer.
export function formatTime(date, time, seriesTimezone, viewerTimezone) {
  // Parse as UTC temporarily so we can do offset arithmetic
  const d = new Date(`${date}T${time}:00Z`)
  // Find what this UTC instant looks like in the series timezone
  const inSeries = new Intl.DateTimeFormat('sv-SE', {
    timeZone: seriesTimezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(d).replace(' ', 'T') + 'Z'
  // Actual UTC instant = d shifted by the timezone offset
  const actualUTC = new Date(d.getTime() * 2 - new Date(inSeries).getTime())
  return actualUTC.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: viewerTimezone,
  })
}

export function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
