import {
  parseCycles,
  formatTime,
  ensureBaseDate,
  calculateTimes,
} from '../src/sleep-cycle-calculator/index';

describe('Sleep Cycle Calculator', () => {
  describe('parseCycles', () => {
    it('should parse comma-separated cycles', () => {
      expect(parseCycles('5,6')).toEqual([5, 6]);
    });

    it('should parse space-separated cycles', () => {
      expect(parseCycles('5 6 7')).toEqual([5, 6, 7]);
    });

    it('should parse mixed separators', () => {
      expect(parseCycles('5,6 7;8/9')).toEqual([5, 6, 7, 8, 9]);
    });

    it('should remove duplicates', () => {
      expect(parseCycles('5,5,6,6')).toEqual([5, 6]);
    });

    it('should filter out invalid numbers', () => {
      expect(parseCycles('5,abc,6,0,13')).toEqual([5, 6]);
    });

    it('should handle empty string', () => {
      expect(parseCycles('')).toEqual([]);
    });

    it('should only accept cycles between 1-12', () => {
      expect(parseCycles('0,1,5,12,13')).toEqual([1, 5, 12]);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2025-10-19T14:30:00');
      const formatted = formatTime(date);
      // Result depends on locale, but should contain hours and minutes
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('ensureBaseDate', () => {
    it('should create date from valid inputs', () => {
      const result = ensureBaseDate('2025-10-19', '14:30');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(9); // October is month 9 (0-indexed)
      expect(result.getDate()).toBe(19);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('should use current date when date is empty', () => {
      const now = new Date();
      const result = ensureBaseDate('', '14:30');
      expect(result.getFullYear()).toBe(now.getFullYear());
      expect(result.getMonth()).toBe(now.getMonth());
      expect(result.getDate()).toBe(now.getDate());
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('should use current time when time is empty', () => {
      const now = new Date();
      const result = ensureBaseDate('2025-10-19', '');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(9);
      expect(result.getDate()).toBe(19);
      expect(result.getHours()).toBe(now.getHours());
      expect(result.getMinutes()).toBe(now.getMinutes());
    });
  });

  describe('calculateTimes', () => {
    const baseDate = new Date('2025-10-19T22:00:00'); // 10 PM

    it('should calculate wake times from bedtime', () => {
      const results = calculateTimes(baseDate, [5, 6], 15, 'bed');

      expect(results).toHaveLength(2);

      // 5 cycles = 5 * 90 + 15 = 465 minutes = 7h 45m -> 5:45 AM
      expect(results[0].cycles).toBe(5);
      expect(results[0].hours).toBe('7.5');
      expect(results[0].icon).toBe('⏰');

      // 6 cycles = 6 * 90 + 15 = 555 minutes = 9h 15m -> 7:15 AM
      expect(results[1].cycles).toBe(6);
      expect(results[1].hours).toBe('9.0');
      expect(results[1].icon).toBe('⏰');
    });

    it('should calculate bedtime from wake time', () => {
      const wakeTime = new Date('2025-10-20T06:00:00'); // 6 AM
      const results = calculateTimes(wakeTime, [5, 6], 15, 'wake');

      expect(results).toHaveLength(2);

      // 5 cycles back = 465 minutes = 7h 45m -> 10:15 PM previous day
      expect(results[0].cycles).toBe(5);
      expect(results[0].hours).toBe('7.5');
      expect(results[0].icon).toBe('🛌');

      // 6 cycles back = 555 minutes = 9h 15m -> 8:45 PM previous day
      expect(results[1].cycles).toBe(6);
      expect(results[1].hours).toBe('9.0');
      expect(results[1].icon).toBe('🛌');
    });

    it('should handle zero latency', () => {
      const results = calculateTimes(baseDate, [5], 0, 'bed');

      expect(results).toHaveLength(1);
      // 5 cycles = 5 * 90 = 450 minutes = 7h 30m
      expect(results[0].hours).toBe('7.5');
    });

    it('should handle custom latency', () => {
      const results = calculateTimes(baseDate, [5], 30, 'bed');

      expect(results).toHaveLength(1);
      // 5 cycles = 5 * 90 + 30 = 480 minutes = 8h
      expect(results[0].hours).toBe('7.5'); // cycles * 1.5, not including latency
    });

    it('should handle multiple cycles', () => {
      const results = calculateTimes(
        baseDate,
        [1, 2, 3, 4, 5, 6, 7],
        15,
        'bed',
      );

      expect(results).toHaveLength(7);
      expect(results.map((r) => r.cycles)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should format hours correctly', () => {
      const results = calculateTimes(baseDate, [1, 5, 10], 0, 'bed');

      expect(results[0].hours).toBe('1.5'); // 1 cycle = 1.5h
      expect(results[1].hours).toBe('7.5'); // 5 cycles = 7.5h
      expect(results[2].hours).toBe('15.0'); // 10 cycles = 15h
    });
  });
});
