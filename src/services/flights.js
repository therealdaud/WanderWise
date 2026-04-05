// src/services/flights.js  —  Duffel API (via /api/flights Vercel function)

import axios from 'axios';

/**
 * Resolve any free-text input (city name, IATA code) to an airport object.
 * Returns: { iataCode, cityName, countryName }
 */
export async function resolveAirport(query) {
  const res = await axios.get('/api/airports', {
    params: { query: query.trim() },
  });

  const suggestions = res.data?.data;
  if (!suggestions || suggestions.length === 0) {
    throw new Error(`No airport found for "${query}". Try a city name or IATA code.`);
  }

  // Prefer a result with an IATA code (airports) over generic places
  const place = suggestions.find(s => s.iata_code) ?? suggestions[0];

  if (!place.iata_code) {
    throw new Error(`Could not resolve an airport for "${query}". Please try a different input.`);
  }

  return {
    iataCode:    place.iata_code,
    cityName:    place.city_name ?? place.name ?? query,
    countryName: place.country_name ?? '',
  };
}

/**
 * Search for round-trip flights between two IATA codes on given dates.
 * Returns the raw Duffel offers array.
 */
export async function searchFlights({ originIata, destinationIata, departureDate, returnDate }) {
  const res = await axios.post('/api/flights', {
    origin:        originIata,
    destination:   destinationIata,
    departureDate,
    returnDate,
  });

  return res.data?.data?.offers ?? [];
}

/**
 * Parse an ISO 8601 duration string (e.g. "PT2H30M") to total minutes.
 */
function parseDurationMins(iso) {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return parseInt(match?.[1] ?? 0) * 60 + parseInt(match?.[2] ?? 0);
}

/**
 * Extract the cheapest Duffel offer and return a normalised flight object.
 */
export function getCheapestFlight(offers) {
  if (!offers || offers.length === 0) return null;

  const sorted = [...offers].sort(
    (a, b) => parseFloat(a.total_amount ?? Infinity) - parseFloat(b.total_amount ?? Infinity)
  );

  const best      = sorted[0];
  const outbound  = best.slices?.[0];
  const returnLeg = best.slices?.[1];
  const outSeg    = outbound?.segments?.[0];
  const retSeg    = returnLeg?.segments?.[0];
  const stops     = Math.max(0, (outbound?.segments?.length ?? 1) - 1);
  const price     = parseFloat(best.total_amount ?? 0);

  return {
    price,
    priceFormatted:  `$${price.toFixed(0)}`,
    airline:         outSeg?.marketing_carrier?.name
                  ?? outSeg?.operating_carrier?.name
                  ?? 'Unknown Airline',
    stops,
    durationMins:    parseDurationMins(outbound?.duration),
    departure:       outSeg?.departing_at  ?? null,
    arrival:         outSeg?.arriving_at   ?? null,
    returnDeparture: retSeg?.departing_at  ?? null,
    returnArrival:   retSeg?.arriving_at   ?? null,
  };
}
