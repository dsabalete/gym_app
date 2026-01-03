import { describe, it, expect } from 'vitest'
import { formatDateUTC, getUTCStartOfWeek, getUTCEndOfWeek, isDateInCurrentUTCWeek } from './date'

describe('date utilities', () => {
    describe('formatDateUTC', () => {
        it('formats a date string correctly', () => {
            const result = formatDateUTC('2024-01-15')
            expect(result).toBe('Monday, January 15, 2024')
        })

        it('formats a different date correctly', () => {
            const result = formatDateUTC('2024-12-25')
            expect(result).toBe('Wednesday, December 25, 2024')
        })

        it('handles ISO date strings with time', () => {
            const result = formatDateUTC('2024-06-10T12:30:00Z')
            expect(result).toBe('Monday, June 10, 2024')
        })
    })

    describe('getUTCStartOfWeek', () => {
        it('returns start of week for Monday as week start (default)', () => {
            const date = new Date('2024-01-17T12:00:00Z') // Wednesday
            const result = getUTCStartOfWeek(date, 1) // Monday = 1
            expect(result.toISOString()).toBe('2024-01-15T00:00:00.000Z') // Previous Monday
        })

        it('returns start of week for Sunday as week start', () => {
            const date = new Date('2024-01-17T12:00:00Z') // Wednesday
            const result = getUTCStartOfWeek(date, 0) // Sunday = 0
            expect(result.toISOString()).toBe('2024-01-14T00:00:00.000Z') // Previous Sunday
        })

        it('returns same day if already at week start', () => {
            const date = new Date('2024-01-15T12:00:00Z') // Monday
            const result = getUTCStartOfWeek(date, 1) // Monday = 1
            expect(result.toISOString()).toBe('2024-01-15T00:00:00.000Z')
        })

        it('uses current date when no date provided', () => {
            const result = getUTCStartOfWeek()
            expect(result).toBeInstanceOf(Date)
            expect(result.getUTCHours()).toBe(0)
            expect(result.getUTCMinutes()).toBe(0)
            expect(result.getUTCSeconds()).toBe(0)
        })
    })

    describe('getUTCEndOfWeek', () => {
        it('returns end of week (7 days after start)', () => {
            const date = new Date('2024-01-17T12:00:00Z') // Wednesday
            const result = getUTCEndOfWeek(date, 1) // Monday = 1
            expect(result.toISOString()).toBe('2024-01-22T00:00:00.000Z') // Next Monday
        })

        it('returns end of week for Sunday as week start', () => {
            const date = new Date('2024-01-17T12:00:00Z') // Wednesday
            const result = getUTCEndOfWeek(date, 0) // Sunday = 0
            expect(result.toISOString()).toBe('2024-01-21T00:00:00.000Z') // Next Sunday
        })

        it('uses current date when no date provided', () => {
            const result = getUTCEndOfWeek()
            expect(result).toBeInstanceOf(Date)
        })
    })

    describe('isDateInCurrentUTCWeek', () => {
        it('returns true for a date in the current week', () => {
            const now = new Date()
            const startOfWeek = getUTCStartOfWeek(now, 1)
            const midWeek = new Date(startOfWeek.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days after start

            const result = isDateInCurrentUTCWeek(midWeek.toISOString(), 1)
            expect(result).toBe(true)
        })

        it('returns false for a date in the previous week', () => {
            const now = new Date()
            const startOfWeek = getUTCStartOfWeek(now, 1)
            const previousWeek = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days before

            const result = isDateInCurrentUTCWeek(previousWeek.toISOString(), 1)
            expect(result).toBe(false)
        })

        it('returns false for a date in the next week', () => {
            const now = new Date()
            const endOfWeek = getUTCEndOfWeek(now, 1)
            const nextWeek = new Date(endOfWeek.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day after end

            const result = isDateInCurrentUTCWeek(nextWeek.toISOString(), 1)
            expect(result).toBe(false)
        })

        it('returns true for start of current week', () => {
            const now = new Date()
            const startOfWeek = getUTCStartOfWeek(now, 1)

            const result = isDateInCurrentUTCWeek(startOfWeek.toISOString(), 1)
            expect(result).toBe(true)
        })
    })
})
