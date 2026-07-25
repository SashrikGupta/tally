const moment = require('moment');

const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Activity is stored on the user as `[{ date: 'YYYY-MM-DD', value: Number }]`,
 * one entry per active day. Three controllers were each maintaining that array
 * with their own copy of the same find-or-push block; this is the shared one.
 *
 * Mutates the document in place — the caller still owns saving it.
 */
function bumpActivity(userDoc, amount = 10) {
  if (!userDoc) return;
  if (!Array.isArray(userDoc.activity)) userDoc.activity = [];

  const today = moment().format(DATE_FORMAT);
  const entry = userDoc.activity.find((item) => item.date === today);
  if (entry) entry.value += amount;
  else userDoc.activity.push({ date: today, value: amount });
}

/**
 * Derives streak and volume stats from an activity array.
 *
 * Computed server-side rather than in the client so every surface that shows a
 * streak agrees on it — in particular on what "current" means. A streak stays
 * alive if the user was active today *or* yesterday: counting only today would
 * flip everyone's streak to zero at midnight, before they have had any chance
 * to act on it.
 */
function activityStats(activity = []) {
  const byDate = new Map();
  for (const item of activity) {
    if (!item || !item.date) continue;
    const value = Number(item.value) || 0;
    byDate.set(item.date, (byDate.get(item.date) || 0) + value);
  }

  const activeDays = [...byDate.entries()]
    .filter(([, value]) => value > 0)
    .map(([date]) => date)
    .sort();

  const empty = {
    currentStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    totalActivity: 0,
    bestDay: null,
    bestDayValue: 0,
    last30: 0,
    activeToday: false,
  };
  if (activeDays.length === 0) return empty;

  // Longest run of consecutive calendar days.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < activeDays.length; i += 1) {
    const gap = moment(activeDays[i]).diff(moment(activeDays[i - 1]), 'days');
    run = gap === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const today = moment().startOf('day');
  const lastActive = moment(activeDays[activeDays.length - 1]).startOf('day');
  const sinceLast = today.diff(lastActive, 'days');

  let current = 0;
  if (sinceLast <= 1) {
    current = 1;
    for (let i = activeDays.length - 1; i > 0; i -= 1) {
      if (moment(activeDays[i]).diff(moment(activeDays[i - 1]), 'days') === 1) current += 1;
      else break;
    }
  }

  let bestDay = activeDays[0];
  let bestDayValue = byDate.get(bestDay) || 0;
  let totalActivity = 0;
  for (const [date, value] of byDate) {
    totalActivity += value;
    if (value > bestDayValue) {
      bestDay = date;
      bestDayValue = value;
    }
  }

  const cutoff = moment().subtract(29, 'days').startOf('day');
  const last30 = activeDays.filter((date) => !moment(date).isBefore(cutoff)).length;

  return {
    currentStreak: current,
    longestStreak: longest,
    totalActiveDays: activeDays.length,
    totalActivity,
    bestDay,
    bestDayValue,
    last30,
    activeToday: sinceLast === 0,
  };
}

module.exports = { bumpActivity, activityStats, DATE_FORMAT };
