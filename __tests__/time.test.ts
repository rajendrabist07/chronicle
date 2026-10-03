import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime } from '../app/lib/time';

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
