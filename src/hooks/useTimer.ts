import { useEffect, useState } from 'react';

interface TimeBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isCountingUp: boolean;
}

function breakdownMs(ms: number): Omit<TimeBreakdown, 'totalMs' | 'isCountingUp'> {
  const absMs = Math.abs(ms);
  const totalSeconds = Math.floor(absMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  return { years, months, days, hours, minutes, seconds };
}

export function useTimer(
  startDate: string,
  endDate?: string | null,
  goalDate?: string | null
): TimeBreakdown {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (endDate) return; // completed — no ticking
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  const start = new Date(startDate).getTime();

  if (endDate) {
    // Completed: show total elapsed
    const end = new Date(endDate).getTime();
    const diff = end - start;
    return { ...breakdownMs(diff), totalMs: diff, isCountingUp: false };
  }

  if (goalDate) {
    // Has goal: count down to goal
    const goal = new Date(goalDate).getTime();
    const diff = goal - now;
    return { ...breakdownMs(diff), totalMs: diff, isCountingUp: diff < 0 };
  }

  // Ongoing: count up from start
  const diff = now - start;
  return { ...breakdownMs(diff), totalMs: diff, isCountingUp: true };
}

export function formatTime(t: TimeBreakdown, short = true): string {
  const parts: string[] = [];
  if (t.years > 0) parts.push(`${t.years}${short ? 'y' : ' years'}`);
  if (t.months > 0) parts.push(`${t.months}${short ? 'mo' : ' months'}`);
  if (t.days > 0) parts.push(`${t.days}${short ? 'd' : ' days'}`);
  if (t.hours > 0) parts.push(`${t.hours}${short ? 'h' : ' hours'}`);
  if (t.minutes > 0) parts.push(`${t.minutes}${short ? 'm' : ' min'}`);
  parts.push(`${t.seconds}${short ? 's' : ' sec'}`);
  return parts.join(' ');
}

export function formatTimeCompact(t: TimeBreakdown): string {
  if (t.years > 0) return `${t.years}y ${t.months}mo ${t.days}d`;
  if (t.months > 0) return `${t.months}mo ${t.days}d ${t.hours}h`;
  if (t.days > 0) return `${t.days}d ${t.hours}h ${t.minutes}m`;
  return `${t.hours}h ${t.minutes}m ${t.seconds}s`;
}
