// src/services/hotels.js  —  Duffel Stays API (via /api/stays Vercel function)

import axios from 'axios';

/**
 * For Duffel Stays the "destination" is just the city name — geocoding to
 * coordinates happens inside the serverless function.  We keep this function
 * so tripFinder.js doesn't need to change its call pattern.
 */
export async function resolveHotelDestination(cityName) {
  return { entityId: cityName.trim(), name: cityName.trim() };
}

/**
 * Search hotels (Duffel Stays) at the given city for the date range.
 * entityId here is the city name passed through from resolveHotelDestination.
 * Returns a normalised array sorted by total price (cheapest first).
 */
export async function searchHotels({ entityId: cityName, checkinDate, checkoutDate }) {
  const res = await axios.post('/api/stays', {
    cityName,
    checkinDate,
    checkoutDate,
  });

  const results = res.data?.data?.results;
  if (!Array.isArray(results)) {
    console.warn('Unexpected Duffel Stays response shape:', JSON.stringify(res.data).slice(0, 200));
    return [];
  }

  return results
    .map(r => {
      const acc        = r.accommodation ?? {};
      const totalPrice = parseFloat(r.cheapest_rate_total_amount ?? r.total_amount ?? 0);

      return {
        id:         r.id ?? acc.id,
        name:       acc.name ?? r.name ?? 'Unknown Hotel',
        address:    acc.location?.address?.line_one ?? '',
        totalPrice,
        currency:   r.cheapest_rate_currency ?? 'USD',
        rating:     acc.review_score ?? r.rating?.value ?? 0,
        ratingWord: acc.review_count ? `${acc.review_count} reviews` : '',
        stars:      acc.rating ?? r.stars ?? 0,
        photo:      acc.photos?.[0]?.url ?? r.photos?.[0]?.url ?? null,
      };
    })
    .filter(h => h.totalPrice > 0)
    .sort((a, b) => a.totalPrice - b.totalPrice);
}
