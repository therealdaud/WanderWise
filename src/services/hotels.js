// src/services/hotels.js  —  Air Scraper API (sky-scrapper.p.rapidapi.com)

import axios from 'axios';
import { BASE_URL, apiHeaders } from './api';
import { withRetry } from '../utils/rateLimit';

/**
 * Resolve a city name to an entityId used by the hotel search endpoint.
 * Returns: { entityId, name }
 */
export async function resolveHotelDestination(cityName) {
  const res = await withRetry(() =>
    axios.get(`${BASE_URL}/api/v1/hotels/searchDestinationOrHotel`, {
      params:  { query: cityName.trim() },
      headers: apiHeaders(),
    })
  );

  // Response: { status, data: [ { entityId, type, name, ... } ] }
  const data = res.data?.data;
  if (!data || data.length === 0) {
    throw new Error(`No hotel destination found for "${cityName}".`);
  }

  // Prefer a CITY result over an individual hotel
  const city = data.find(d => d.type === 'CITY' || d.type === 'city')
            ?? data.find(d => d.entityType === 'CITY')
            ?? data[0];

  return {
    entityId: city.entityId ?? city.gaiaId ?? city.id,
    name:     city.name     ?? city.localizedName ?? cityName,
  };
}

/**
 * Search hotels at the resolved destination for the given date range.
 * Returns a normalised array sorted by total price (cheapest first).
 */
export async function searchHotels({ entityId, checkinDate, checkoutDate }) {
  const res = await withRetry(() =>
    axios.get(`${BASE_URL}/api/v1/hotels/searchHotels`, {
      params: {
        entityId,
        checkIn:     checkinDate,
        checkOut:    checkoutDate,
        adults:      2,
        rooms:       1,
        currency:    'USD',
        market:      'en-US',
        countryCode: 'US',
        locale:      'en-US',
      },
      headers: apiHeaders(),
    })
  );

  // The API can nest the hotel list in several ways — try all known paths
  const raw =
    res.data?.data?.hotels?.results            ??  // common shape
    res.data?.data?.results?.hotelCards        ??  // alternate shape
    res.data?.data?.hotelCards                 ??
    res.data?.data?.results                    ??
    res.data?.data                             ??
    [];

  if (!Array.isArray(raw)) {
    console.warn('Unexpected hotel response shape:', JSON.stringify(res.data).slice(0, 300));
    return [];
  }

  return raw
    .map(h => {
      // Price can live under different keys depending on API version
      const totalPrice =
        h.price?.lead?.amount       ??
        h.price?.totalPrice?.amount ??
        h.rawPrice                  ??
        h.total                     ??
        0;

      return {
        id:         h.hotelId   ?? h.id,
        name:       h.name      ?? h.hotelName ?? 'Unknown Hotel',
        address:    h.address   ?? '',
        totalPrice: Number(totalPrice),
        currency:   h.price?.lead?.currencyCode ?? 'USD',
        rating:     h.reviewSummary?.score      ?? h.guestRating ?? 0,
        ratingWord: h.reviewSummary?.scoreDesc  ?? '',
        stars:      h.starRating ?? h.stars     ?? 0,
        photo:      h.images?.[0]?.url ?? h.heroImage?.url ?? null,
      };
    })
    .filter(h => h.totalPrice > 0)
    .sort((a, b) => a.totalPrice - b.totalPrice);
}
