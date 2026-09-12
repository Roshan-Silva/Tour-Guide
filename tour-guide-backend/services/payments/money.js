export const CURRENCY = 'LKR';
export const MINOR_UNIT_SCALE = 100;

export const toMinorUnits = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) throw new Error('Amount must be a non-negative number');
  return Math.round((value + Number.EPSILON) * MINOR_UNIT_SCALE);
};

export const fromMinorUnits = (amount) => Number(amount) / MINOR_UNIT_SCALE;

export const getCommissionRateBps = () => {
  const rate = Number(process.env.PLATFORM_COMMISSION_RATE ?? 0.02);
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) throw new Error('PLATFORM_COMMISSION_RATE must be between 0 and 1');
  return Math.round(rate * 10000);
};

export const calculateBookingMoney = ({ dailyRate, numberOfDays, commissionRateBps = getCommissionRateBps() }) => {
  const driverDailyRate = toMinorUnits(dailyRate);
  const driverSubtotal = driverDailyRate * Number(numberOfDays);
  const platformCommissionAmount = Math.round(driverSubtotal * commissionRateBps / 10000);
  return { currency: CURRENCY, driverDailyRate, driverSubtotal, platformCommissionRateBps: commissionRateBps, platformCommissionAmount, travelerTotal: driverSubtotal + platformCommissionAmount };
};

// Active direct-payment model. The traveler pays agreedTourPrice directly to
// the driver; commissionAmount is a separate amount owed by the driver.
export const calculateCommissionSnapshot = ({ dailyRate, numberOfDays, commissionRateBps = getCommissionRateBps() }) => {
  const driverDailyRate = toMinorUnits(dailyRate);
  const agreedTourPrice = driverDailyRate * Number(numberOfDays);
  const commissionAmount = Math.round(agreedTourPrice * commissionRateBps / 10000);
  return { currency: CURRENCY, driverDailyRate, agreedTourPrice, commissionRateBps, commissionAmount };
};
