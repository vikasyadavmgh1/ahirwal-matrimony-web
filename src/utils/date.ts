/** Normalize backend LocalDateTime strings (e.g. "2026-06-25T14:11:06.946935")
 *  to millisecond precision with explicit UTC so all browsers parse correctly. */
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN)
  // Truncate fractional seconds to 3 digits (ms), append Z if no timezone present
  const normalized = dateStr
    .replace(/(\.\d{3})\d+/, '$1')            // microseconds → milliseconds
    .replace(/(\d{2}:\d{2}:\d{2}(?:\.\d+)?)$/, '$1Z') // append Z if no tz offset
  return new Date(normalized)
}

export function formatDistanceToNow(dateStr: string): string {
  if (!dateStr) return ''
  const d = parseDate(dateStr)
  if (isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTime(dateStr: string): string {
  const d = parseDate(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
