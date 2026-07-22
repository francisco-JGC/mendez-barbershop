export type DashboardPeriod = 'day' | 'yesterday' | 'week' | 'month';

// Colombia has no DST — UTC-5 year-round. All date-range math for the
// dashboard is done in shop-local time so that "today" for the user matches
// "today" for the query, regardless of whether the server runs in UTC.
const SHOP_TZ_OFFSET_HOURS = -5;
const SHOP_TZ_OFFSET_MS = SHOP_TZ_OFFSET_HOURS * 60 * 60 * 1000;

function startOfShopDay(instant: Date): Date {
  const shifted = new Date(instant.getTime() + SHOP_TZ_OFFSET_MS);
  const midnightUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
  );
  return new Date(midnightUtc - SHOP_TZ_OFFSET_MS);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function startOfShopWeek(instant: Date): Date {
  const startToday = startOfShopDay(instant);
  const shifted = new Date(startToday.getTime() + SHOP_TZ_OFFSET_MS);
  const dayOfWeek = shifted.getUTCDay(); // 0=Sunday .. 6=Saturday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return addDays(startToday, -daysSinceMonday);
}

function startOfShopMonth(instant: Date): Date {
  const shifted = new Date(instant.getTime() + SHOP_TZ_OFFSET_MS);
  const midnightUtc = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    1,
  );
  return new Date(midnightUtc - SHOP_TZ_OFFSET_MS);
}

export function resolveDateRange(period: DashboardPeriod): {
  from: Date;
  to: Date;
} {
  const now = new Date();

  if (period === 'yesterday') {
    const startToday = startOfShopDay(now);
    return { from: addDays(startToday, -1), to: startToday };
  }

  if (period === 'week') {
    return { from: startOfShopWeek(now), to: now };
  }

  if (period === 'month') {
    return { from: startOfShopMonth(now), to: now };
  }

  return { from: startOfShopDay(now), to: now };
}
