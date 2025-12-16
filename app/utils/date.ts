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
