// src/services/flights.js  —  Air Scraper API (sky-scrapper.p.rapidapi.com)

import axios from 'axios';
import { BASE_URL, apiHeaders } from './api';
import { withRetry } from '../utils/rateLimit';

/**
 * Resolve any free-text input (IATA code, city name, airport name) to a
 * structured airport object: { skyId, entityId, cityName, countryName }
 */
export async function resolveAirport(query) {
  const res = await withRetry(() =>
    axios.get(`${BASE_URL}/api/v1/flights/searchAirport`, {
      params:  { query: query.trim(), locale: 'en-US' },
      headers: apiHeaders(),
    })
  );

  const data = res.data?.data;
  if (!data || data.length === 0) {
    throw new Error(`No airport found for "${query}". Try a city name or IATA code.`);
  }

  const airport  = data[0];
  const skyId    = airport.skyId    || airport.navigation?.relevantFlightParams?.skyId;
  const entityId = airport.entityId || airport.navigation?.entityId;

  if (!skyId || !entityId) {
    throw new Error(`Could not resolve airport for "${query}". Please try a different input.`);
  }

  return {
    skyId,
    entityId,
    cityName:    airport.presentation?.title    || query,
    countryName: airport.presentation?.subtitle || '',
  };
}

/**
 * Search for round-trip flights between two resolved airports on given dates.
 * Returns the raw array of itineraries.
 */
export async function searchFlights({
  originSkyId,
  destinationSkyId,
  originEntityId,
  destinationEntityId,
  departureDate,
  returnDate,
}) {
  const res = await withRetry(() =>
    axios.get(`${BASE_URL}/api/v1/flights/searchFlights`, {
      params: {
        originSkyId,
        destinationSkyId,
        originEntityId,
        destinationEntityId,
        date:        departureDate,
        returnDate,
        cabinClass:  'economy',
        adults:       1,
        sortBy:      'cheapest',
        currency:    'USD',
        market:      'en-US',
        countryCode: 'US',
      },
      headers: apiHeaders(),
    })
  );

  return res.data?.data?.itineraries || [];
}

/**
 * Extract the cheapest itinerary and return a normalised flight object.
 */
export function getCheapestFlight(itineraries) {
  if (!itineraries || itineraries.length === 0) return null;

  const sorted = [...itineraries].sort(
    (a, b) => (a.price?.raw ?? Infinity) - (b.price?.raw ?? Infinity)
  );
  const best      = sorted[0];
  const outbound  = best.legs?.[0];
  const returnLeg = best.legs?.[1];

  return {
    price:           best.price?.raw       ?? 0,
    priceFormatted:  best.price?.formatted ?? `$${best.price?.raw ?? 0}`,
    airline:         outbound?.carriers?.marketing?.[0]?.name ?? 'Unknown Airline',
    stops:           outbound?.stopCount         ?? 0,
    durationMins:    outbound?.durationInMinutes ?? 0,
    departure:       outbound?.departure  ?? null,
    arrival:         outbound?.arrival    ?? null,
    returnDeparture: returnLeg?.departure ?? null,
    returnArrival:   returnLeg?.arrival   ?? null,
  };
}
