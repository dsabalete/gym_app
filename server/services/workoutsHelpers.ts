export function filterOutArchived(items: any[]) {
  return (items || []).filter((w: any) => w?.archived !== true)
}

export function searchArchived(items: any[], q: string) {
  if (!q) return items || []
  const term = q.toLowerCase()
  return (items || []).filter((w: any) => {
    const dateStr = String(w?.date || '').toLowerCase()
    const exNames = (w?.exercises || []).map((e: any) => String(e?.name || '').toLowerCase()).join(' ')
    return dateStr.includes(term) || exNames.includes(term)
  })
}
