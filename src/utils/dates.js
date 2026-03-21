// src/utils/dates.js

export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateNights(checkin, checkout) {
  const a = new Date(checkin);
  const b = new Date(checkout);
  return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

/**
 * When the user leaves dates blank, generate a set of candidate trip windows:
 *   - 4 weekend trips  (Fri → Mon, 3 nights)  starting from next week
 *   - 2 week-long trips (Sat → Sat, 7 nights)  starting ~2 weeks out
 */
export function getAutoDateCombinations() {
  const combinations = [];
  const today = new Date();

  // ── Weekend trips ────────────────────────────────────────────────────────
  // Find the next Friday that is at least 7 days away
  const nextFri = new Date(today);
  nextFri.setDate(nextFri.getDate() + 7);
  const dayOfWeek = nextFri.getDay();           // 0=Sun … 6=Sat
  const daysUntilFri = (5 - dayOfWeek + 7) % 7;
  nextFri.setDate(nextFri.getDate() + daysUntilFri);

  for (let i = 0; i < 4; i++) {
    const fri = new Date(nextFri);
    fri.setDate(fri.getDate() + i * 7);
    const mon = new Date(fri);
    mon.setDate(mon.getDate() + 3);

    combinations.push({
      departure: formatDate(fri),
      return:    formatDate(mon),
      nights:    3,
      label:     `Weekend ${i + 1} (${formatDate(fri)} – ${formatDate(mon)})`,
    });
  }

  // ── Week-long trips ──────────────────────────────────────────────────────
  // Find the next Saturday at least 14 days away
  const nextSat = new Date(today);
  nextSat.setDate(nextSat.getDate() + 14);
  const dow2 = nextSat.getDay();
  const daysUntilSat = (6 - dow2 + 7) % 7 || 7;
  nextSat.setDate(nextSat.getDate() + daysUntilSat);

  for (let i = 0; i < 2; i++) {
    const sat = new Date(nextSat);
    sat.setDate(sat.getDate() + i * 14);
    const satNext = new Date(sat);
    satNext.setDate(satNext.getDate() + 7);

    combinations.push({
      departure: formatDate(sat),
      return:    formatDate(satNext),
      nights:    7,
      label:     `Week trip ${i + 1} (${formatDate(sat)} – ${formatDate(satNext)})`,
    });
  }

  return combinations;
}

export function displayDateRange(departure, returnDate) {
  const dep = new Date(departure + 'T00:00:00');
  const ret = new Date(returnDate  + 'T00:00:00');
  const opts = { month: 'short', day: 'numeric' };
  return `${dep.toLocaleDateString('en-US', opts)} – ${ret.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}
