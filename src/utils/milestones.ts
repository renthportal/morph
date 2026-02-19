export interface Milestone {
  label: string;
  fraction: number;
  reached: boolean;
}

export function getMilestones(
  startDate: string,
  goalDate: string | null,
  afterDate: string | null
): Milestone[] {
  if (!goalDate) return [];

  const start = new Date(startDate).getTime();
  const goal = new Date(goalDate).getTime();
  const now = afterDate ? new Date(afterDate).getTime() : Date.now();
  const totalDuration = goal - start;
  const elapsed = now - start;
  const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);

  return [
    { label: 'Start', fraction: 0, reached: progress >= 0 },
    { label: '25%', fraction: 0.25, reached: progress >= 0.25 },
    { label: '50%', fraction: 0.5, reached: progress >= 0.5 },
    { label: '75%', fraction: 0.75, reached: progress >= 0.75 },
    { label: 'Goal', fraction: 1, reached: progress >= 1 },
  ];
}

export function getProgress(
  startDate: string,
  goalDate: string | null,
  afterDate: string | null
): number {
  if (!goalDate) return 0;
  const start = new Date(startDate).getTime();
  const goal = new Date(goalDate).getTime();
  const now = afterDate ? new Date(afterDate).getTime() : Date.now();
  const totalDuration = goal - start;
  if (totalDuration <= 0) return 1;
  return Math.min(Math.max((now - start) / totalDuration, 0), 1);
}
