export const normalizeTripDate = (value, now = new Date()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    throw new Error('A valid trip date is required');
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('A valid trip date is required');
  }

  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  if (date < today) {
    throw new Error('Trip date cannot be in the past');
  }

  return date;
};
