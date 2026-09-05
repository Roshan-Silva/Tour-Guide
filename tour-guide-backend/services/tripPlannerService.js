import { parseDateOnly } from '../utils/dateRange.js';

export const normalizeInterests = (value = []) => (Array.isArray(value) ? value : String(value).split(','))
  .map((item) => item.trim().toLowerCase()).filter(Boolean);

export const validatePlannerInput = ({ startDate: value, numberOfDays, partySize = 1, startingLocation }) => {
  const startDate = parseDateOnly(value, 'Trip start date');
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const days = Number(numberOfDays);
  const travelers = Number(partySize);
  if (startDate < today) throw new Error('Trip start date cannot be in the past');
  if (!Number.isInteger(days) || days < 1 || days > 30) throw new Error('Number of days must be between 1 and 30');
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 20) throw new Error('Number of travelers must be between 1 and 20');
  if (!startingLocation?.trim()) throw new Error('Starting location is required');
  return { startDate, numberOfDays: days, partySize: travelers };
};

export const scoreDestination = (place, interests, startingLocation) => {
  const wanted = new Set(normalizeInterests(interests));
  const attributes = [...(place.tags || []), ...(place.categories || [])].map((item) => item.toLowerCase());
  const matches = [...new Set(attributes.filter((item) => wanted.has(item)))];
  const locationText = `${place.location || ''} ${place.district || ''} ${place.province || ''}`.toLowerCase();
  const locationBonus = startingLocation && locationText.includes(startingLocation.toLowerCase()) ? 2 : 0;
  return { score: matches.length * 4 + locationBonus + (place.activities?.length ? 1 : 0), matches };
};

export const buildItinerary = ({ places, startDate, numberOfDays, interests, startingLocation }) => {
  if (!places.length) throw new Error('No active destinations are available');
  const ranked = places.map((place) => ({ place, ...scoreDestination(place, interests, startingLocation) }))
    .sort((a, b) => b.score - a.score || a.place.name.localeCompare(b.place.name));
  const days = [];
  let cursor = 0;
  while (days.length < numberOfDays) {
    const candidate = ranked[cursor % ranked.length];
    const stay = Math.min(Number(candidate.place.recommendedDuration || 1), numberOfDays - days.length);
    for (let i = 0; i < stay; i += 1) {
      const date = new Date(startDate); date.setUTCDate(date.getUTCDate() + days.length);
      days.push({
        dayNumber: days.length + 1, date, destination: candidate.place._id,
        destinationName: candidate.place.name, image: candidate.place.image, slug: candidate.place.slug, activities: candidate.place.activities?.slice(0, 3) || [],
        notes: candidate.matches.length ? `Recommended for ${candidate.matches.join(', ')}` : 'A well-rounded Sri Lankan experience',
      });
    }
    cursor += 1;
  }
  const endDate = new Date(startDate); endDate.setUTCDate(endDate.getUTCDate() + numberOfDays - 1);
  return { days, endDate, explanation: 'Destinations are ranked by matching interests, starting-area relevance, available activities, and recommended stay length.' };
};
