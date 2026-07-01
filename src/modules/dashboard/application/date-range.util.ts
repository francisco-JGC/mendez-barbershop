export type DashboardPeriod = 'day' | 'month';

export function resolveDateRange(period: DashboardPeriod): {
  from: Date;
  to: Date;
} {
  const now = new Date();
  const to = now;

  if (period === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to };
  }

  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return { from, to };
}
