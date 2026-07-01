export type DashboardPeriod = 'day' | 'yesterday' | 'week' | 'month';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const start = startOfDay(date);
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

export function resolveDateRange(period: DashboardPeriod): {
  from: Date;
  to: Date;
} {
  const now = new Date();

  if (period === 'yesterday') {
    const startOfToday = startOfDay(now);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    return { from: startOfYesterday, to: startOfToday };
  }

  if (period === 'week') {
    return { from: startOfWeek(now), to: now };
  }

  if (period === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to: now };
  }

  return { from: startOfDay(now), to: now };
}
