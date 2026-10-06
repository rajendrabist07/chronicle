import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime, formatDisplayDate, formatMonthYear } from '../app/lib/time';

describe('formatRelativeTime', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-10-04T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns "just now" for dates within 45 seconds', () => {
        const recent = new Date('2026-10-04T11:59:30Z');
        expect(formatRelativeTime(recent)).toBe('just now');
    });

    it('formats minutes correctly', () => {
        const fiveMinutesAgo = new Date('2026-10-04T11:55:00Z');
        expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('formats hours correctly', () => {
        const threeHoursAgo = new Date('2026-10-04T09:00:00Z');
        expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
    });

    it('formats days correctly', () => {
        const twoDaysAgo = new Date('2026-10-02T12:00:00Z');
        expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
    });

    it('handles string input as well as Date objects', () => {
        expect(formatRelativeTime('2026-10-04T11:50:00Z')).toBe('10 minutes ago');
    });
});

describe('formatDisplayDate and formatMonthYear', () => {
    it('formats display date deterministically in UTC', () => {
        expect(formatDisplayDate('2026-10-06T15:30:00Z')).toBe('Oct 6, 2026');
        expect(formatDisplayDate('2025-01-01T00:00:00Z')).toBe('Jan 1, 2025');
    });

    it('formats month and year deterministically in UTC', () => {
        expect(formatMonthYear('2026-10-06T15:30:00Z')).toBe('October 2026');
        expect(formatMonthYear('2025-05-15T00:00:00Z')).toBe('May 2025');
    });

    it('handles invalid or empty date inputs gracefully', () => {
        expect(formatDisplayDate(null)).toBe('');
        expect(formatDisplayDate(undefined)).toBe('');
        expect(formatDisplayDate('invalid-date')).toBe('');
        expect(formatMonthYear(null)).toBe('');
    });
});
