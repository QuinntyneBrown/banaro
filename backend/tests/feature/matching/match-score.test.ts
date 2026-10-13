// Acceptance Test
// Traces to: L2-022
// Description: Given a viewer and a candidate, when the match score is computed, then it is an integer
// 0–100 from the documented factors and weights: distance (1 at 0 km, 0 at 40 km) and recent activity
// (1 within 7 days, 0 from 60 days). Without matching preferences, skill complement and open-to
// alignment do not count and the other two weights fill the whole (D-041).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toStamp } from '@/src/clock';
import { matching } from '@/src/config/banaro';
import { matchScore } from '@/src/services/matching/match-score-service';

const NOW = new Date('2026-10-11T16:00:00Z');
const ago = (hours: number) => toStamp(new Date(NOW.getTime() - hours * 3600 * 1000));
const score = (km: number | null, lastActive: string | null) => matchScore(km, lastActive).value;

describe('match score', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => vi.useRealTimers());

  it('documents the weights in configuration', () => {
    expect(matching.scoreWeights).toEqual({
      skillComplement: 0.35,
      openTo: 0.3,
      distance: 0.2,
      recentActivity: 0.15,
    });
  });

  it('scores 100 for next door and active this week', () => {
    expect(score(0, ago(3 * 24))).toBe(100);
  });

  it('scores 0 at the distance limit and long idle', () => {
    expect(score(40, ago(60 * 24))).toBe(0);
    expect(score(75, null)).toBe(0);
    expect(score(null, null)).toBe(0);
  });

  it('falls linearly with distance to the limit', () => {
    // 0.20 × 0.5 + 0.15 × 1, over 0.35.
    expect(score(20, ago(0))).toBe(71);
    expect(score(10, ago(0))).toBe(86);
  });

  it('falls linearly with activity from seven to sixty days', () => {
    // Halfway: 33.5 days → 0.5. 0.20 × 1 + 0.15 × 0.5, over 0.35.
    expect(score(0, ago(33.5 * 24))).toBe(79);
    expect(score(0, ago(7 * 24))).toBe(100);
    expect(score(0, ago(61 * 24))).toBe(57);
  });

  it('gives reasons: nearby with the distance, and recently active', () => {
    expect(matchScore(1.44, ago(1)).reasons).toEqual([
      { code: 'nearby', km: 1.4 },
      { code: 'recently_active' },
    ]);
    expect(matchScore(55, ago(30 * 24)).reasons).toEqual([]);
  });
});
