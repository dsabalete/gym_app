import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useDebounce } from './debounce'

describe('useDebounce', () => {
    beforeEach(() => {
        // Clear any pending timers before each test
    })

    afterEach(() => {
        // Clean up after each test
    })

    it('delays function execution by the specified wait time', async () => {
        let callCount = 0
        const fn = () => { callCount++ }
        const debounced = useDebounce(fn, 100)

        debounced()
        expect(callCount).toBe(0) // Should not be called immediately

        await new Promise(resolve => setTimeout(resolve, 50))
        expect(callCount).toBe(0) // Should still not be called after 50ms

        await new Promise(resolve => setTimeout(resolve, 60))
        expect(callCount).toBe(1) // Should be called after 100ms total
    })

    it('only executes once for multiple rapid calls', async () => {
        let callCount = 0
        const fn = () => { callCount++ }
        const debounced = useDebounce(fn, 100)

        debounced()
        debounced()
        debounced()
        debounced()

        expect(callCount).toBe(0) // Should not be called immediately

        await new Promise(resolve => setTimeout(resolve, 110))
        expect(callCount).toBe(1) // Should only be called once
    })

    it('preserves the latest arguments', async () => {
        let lastValue = ''
        const fn = (value: string) => { lastValue = value }
        const debounced = useDebounce(fn, 100)

        debounced('first')
        debounced('second')
        debounced('third')

        await new Promise(resolve => setTimeout(resolve, 110))
        expect(lastValue).toBe('third') // Should use the latest argument
    })

    it('resets the timer on each call', async () => {
        let callCount = 0
        const fn = () => { callCount++ }
        const debounced = useDebounce(fn, 100)

        debounced()
        await new Promise(resolve => setTimeout(resolve, 50))
        debounced() // Reset timer
        await new Promise(resolve => setTimeout(resolve, 50))
        expect(callCount).toBe(0) // Should not be called yet

        await new Promise(resolve => setTimeout(resolve, 60))
        expect(callCount).toBe(1) // Should be called after 100ms from last call
    })

    it('uses default wait time of 300ms', async () => {
        let callCount = 0
        const fn = () => { callCount++ }
        const debounced = useDebounce(fn) // No wait time specified

        debounced()
        await new Promise(resolve => setTimeout(resolve, 250))
        expect(callCount).toBe(0) // Should not be called before 300ms

        await new Promise(resolve => setTimeout(resolve, 60))
        expect(callCount).toBe(1) // Should be called after 300ms
    })

    it('handles multiple arguments correctly', async () => {
        let result = { a: 0, b: '' }
        const fn = (a: number, b: string) => { result = { a, b } }
        const debounced = useDebounce(fn, 50)

        debounced(42, 'test')

        await new Promise(resolve => setTimeout(resolve, 60))
        expect(result.a).toBe(42)
        expect(result.b).toBe('test')
    })

    it('can be called multiple times after execution', async () => {
        let callCount = 0
        const fn = () => { callCount++ }
        const debounced = useDebounce(fn, 50)

        debounced()
        await new Promise(resolve => setTimeout(resolve, 60))
        expect(callCount).toBe(1)

        debounced()
        await new Promise(resolve => setTimeout(resolve, 60))
        expect(callCount).toBe(2)

        debounced()
        await new Promise(resolve => setTimeout(resolve, 60))
        expect(callCount).toBe(3)
    })
})
