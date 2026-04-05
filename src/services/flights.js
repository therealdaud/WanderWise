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

  const place = suggestions.find(s => s.iata_code) ?? suggestions[0];

  if (!place.iata_code) {
    throw new Error(`Could not resolve an airport for "${query}". Please try a different input.`);
  }

  // City-level suggestions have city_name: null — fall back to nested airports[0]
  const cityName    = place.city_name ?? place.airports?.[0]?.city_name ?? query;
  const countryCode = place.iata_country_code ?? place.airports?.[0]?.iata_country_code ?? '';

  return { iataCode: place.iata_code, cityName, countryName: countryCode };
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

/** Parse ISO 8601 duration (e.g. "PT10H13M") to total minutes. */
function parseDurationMins(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return parseInt(m?.[1] ?? 0) * 60 + parseInt(m?.[2] ?? 0);
}

/** Return true if every segment on the slice is operated by Duffel's test airline. */
function isDuffelTestFlight(offer) {
  return offer.slices?.every(slice =>
    slice.segments?.every(seg =>
      seg.marketing_carrier?.name === 'Duffel Airways' ||
      seg.operating_carrier?.name === 'Duffel Airways'
    )
  );
}

/**
 * Extract the cheapest real-airline offer and return a normalised flight object.
 * "Duffel Airways" is a sandbox test carrier — filtered out when real options exist.
 */
export function getCheapestFlight(offers) {
  if (!offers || offers.length === 0) return null;

  // Prefer real carriers; only fall back to test airline if nothing else available
  const realOffers = offers.filter(o => !isDuffelTestFlight(o));
  const pool       = realOffers.length > 0 ? realOffers : [];

  // If all offers were sandbox-only, return null (skip this route)
  if (pool.length === 0) return null;

  const sorted    = [...pool].sort((a, b) =>
    parseFloat(a.total_amount ?? Infinity) - parseFloat(b.total_amount ?? Infinity)
  );
  const best      = sorted[0];
  const outbound  = best.slices?.[0];
  const returnLeg = best.slices?.[1];

  // First segment = correct departure; LAST segment = correct final arrival
  const outFirstSeg = outbound?.segments?.[0];
  const outLastSeg  = outbound?.segments?.at(-1) ?? outFirstSeg;
  const retFirstSeg = returnLeg?.segments?.[0];
  const retLastSeg  = returnLeg?.segments?.at(-1) ?? retFirstSeg;

  const stops = Math.max(0, (outbound?.segments?.length ?? 1) - 1);
  const price = parseFloat(best.total_amount ?? 0);

  return {
    price,
    priceFormatted:  `$${price.toFixed(0)}`,
    airline:         outFirstSeg?.marketing_carrier?.name
                  ?? outFirstSeg?.operating_carrier?.name
                  ?? 'Unknown Airline',
    stops,
    durationMins:    parseDurationMins(outbound?.duration),
    departure:       outFirstSeg?.departing_at ?? null,   // takeoff time
    arrival:         outLastSeg?.arriving_at   ?? null,   // final destination landing
    returnDeparture: retFirstSeg?.departing_at ?? null,   // return takeoff
    returnArrival:   retLastSeg?.arriving_at   ?? null,   // return final landing
  };
}
