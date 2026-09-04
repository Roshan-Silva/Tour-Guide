const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_TRIP_DAYS = 60;

export const parseDateOnly = (value, fieldName) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) throw new Error(`${fieldName} must use YYYY-MM-DD format`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error(`${fieldName} is invalid`);
  return date;
};

export const validateDateRange = (startValue, endValue, now = new Date()) => {
  const startDate = parseDateOnly(startValue, 'Start date');
  const endDate = parseDateOnly(endValue, 'End date');
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  if (startDate < today) throw new Error('Start date cannot be in the past');
  if (endDate < startDate) throw new Error('End date must be on or after the start date');
  const numberOfDays = Math.floor((endDate - startDate) / DAY_MS) + 1;
  if (numberOfDays > MAX_TRIP_DAYS) throw new Error(`Trips cannot exceed ${MAX_TRIP_DAYS} days`);
  return { startDate, endDate, numberOfDays };
};

export const rangesOverlap = (firstStart, firstEnd, secondStart, secondEnd) => firstStart <= secondEnd && firstEnd >= secondStart;

export const enumerateDates = (startDate, endDate) => {
  const dates = [];
  for (let timestamp = startDate.getTime(); timestamp <= endDate.getTime(); timestamp += DAY_MS) dates.push(new Date(timestamp));
  return dates;
};

export const calculatePrice = (dailyRate, numberOfDays) => {
  const rate = Number(dailyRate);
  if (!Number.isFinite(rate) || rate < 0) throw new Error('Driver daily rate is invalid');
  return rate * numberOfDays;
};
