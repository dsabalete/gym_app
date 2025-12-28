export function formatDateUTC(dateString: string) {
    const d = new Date(dateString)
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    return fmt.format(d)
}

export function getUTCStartOfWeek(date: Date = new Date(), weekStart: number = 1) {
    const day = date.getUTCDay()
    const offset = (day - weekStart + 7) % 7
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - offset, 0, 0, 0, 0))
    return start
}

export function getUTCEndOfWeek(date: Date = new Date(), weekStart: number = 1) {
    const start = getUTCStartOfWeek(date, weekStart)
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    return end
}

export function isDateInCurrentUTCWeek(dateString: string, weekStart: number = 1) {
    const d = new Date(dateString)
    const start = getUTCStartOfWeek(new Date(), weekStart)
    const end = getUTCEndOfWeek(new Date(), weekStart)
    return d >= start && d < end
}
