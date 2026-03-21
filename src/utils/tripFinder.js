// src/utils/tripFinder.js
// ALL imports must come first in ES modules — never put code before them

import {
  mockResolveAirport          as _mockResolveAirport,
  mockSearchFlights           as _mockSearchFlights,
  mockResolveHotelDestination as _mockResolveHotelDest,
  mockSearchHotels            as _mockSearchHotels,
} from '../services/mockData';

import {
  resolveAirport  as _realResolveAirport,
  searchFlights   as _realSearchFlights,
  getCheapestFlight,
} from '../services/flights';

import {
  resolveHotelDestination as _realResolveHotelDest,
  searchHotels            as _realSearchHotels,
} from '../services/hotels';

import { getAutoDateCombinations, calculateNights } from './dates';
import { delay }                                    from './rateLimit';

// ── Toggle ────────────────────────────────────────────────────────────────────
// Set MOCK_MODE to false once you have working API credentials
const MOCK_MODE = true;

const resolveAirport          = MOCK_MODE ? _mockResolveAirport  : _realResolveAirport;
const searchFlightsAPI        = MOCK_MODE ? _mockSearchFlights   : _realSearchFlights;
const resolveHotelDestination = MOCK_MODE ? _mockResolveHotelDest: _realResolveHotelDest;
const searchHotelsAPI         = MOCK_MODE ? _mockSearchHotels    : _realSearchHotels;

// Pause between live API calls (ignored in mock mode but kept for safety)
const CALL_DELAY_MS = 1500;

const POPULAR_DESTINATIONS = [
  'New York', 'Miami', 'Los Angeles', 'Las Vegas', 'Orlando',
  'Chicago', 'Cancun', 'London', 'Paris', 'Tokyo',
];

async function searchDestination({ originAirport, destName, budget, dateWindows, onProgress, tag }) {
  let destAirport, hotelDest;

  try {
    destAirport = await resolveAirport(destName);
    if (!MOCK_MODE) await delay(CALL_DELAY_MS);
  } catch (err) {
    const s = err.response?.status;
    if (s === 403) throw new Error(`Air Scraper API 403 on airport search — check your RapidAPI subscription.`);
    if (s === 429) throw new Error(`Rate limit hit. Please wait 60 seconds and try again.`);
    console.warn(`Could not resolve destination "${destName}":`, err.message);
    return [];
  }

  try {
    hotelDest = await resolveHotelDestination(destAirport.cityName);
    if (!MOCK_MODE) await delay(CALL_DELAY_MS);
  } catch (err) {
    const s = err.response?.status;
    if (s === 403) throw new Error(`Air Scraper API 403 on hotel location — check your RapidAPI subscription.`);
    if (s === 429) throw new Error(`Rate limit hit. Please wait 60 seconds and try again.`);
    console.warn(`Could not resolve hotel destination for "${destName}":`, err.message);
    return [];
  }

  const results = [];

  for (let i = 0; i < dateWindows.length; i++) {
    const dates = dateWindows[i];
    onProgress(`${tag} — checking ${dates.label}… (${i + 1}/${dateWindows.length})`);

    try {
      let itineraries;
      try {
        itineraries = await searchFlightsAPI({
          originSkyId:         originAirport.skyId,
          destinationSkyId:    destAirport.skyId,
          originEntityId:      originAirport.entityId,
          destinationEntityId: destAirport.entityId,
          departureDate:       dates.departure,
          returnDate:          dates.return,
        });
      } catch (err) {
        const s = err.response?.status;
        if (s === 403) throw new Error(`Air Scraper API 403 on flight search — check your subscription tier.`);
        if (s === 429) throw new Error(`Rate limit hit. Please wait 60 seconds and try again.`);
        throw err;
      }
      if (!MOCK_MODE) await delay(CALL_DELAY_MS);

      const cheapestFlight = getCheapestFlight(itineraries);
      if (!cheapestFlight) continue;

      const flightBudget = budget - cheapestFlight.price;
      if (flightBudget <= 0) continue;

      let hotels;
      try {
        hotels = await searchHotelsAPI({
          entityId:     hotelDest.entityId,
          checkinDate:  dates.departure,
          checkoutDate: dates.return,
        });
      } catch (err) {
        const s = err.response?.status;
        if (s === 403) throw new Error(`Air Scraper API 403 on hotel search — check your subscription tier.`);
        if (s === 429) throw new Error(`Rate limit hit. Please wait 60 seconds and try again.`);
        throw err;
      }
      if (!MOCK_MODE) await delay(CALL_DELAY_MS);

      const affordableHotels = hotels.filter(h => h.totalPrice <= flightBudget);
      if (affordableHotels.length === 0) continue;

      const ranked = [...affordableHotels].sort((a, b) => {
        const valA = (a.rating ?? 0) / (a.totalPrice || 1);
        const valB = (b.rating ?? 0) / (b.totalPrice || 1);
        return valB - valA;
      });

      const bestHotel = ranked[0];
      const totalCost = cheapestFlight.price + bestHotel.totalPrice;

      results.push({
        id:                  `${dates.departure}-${destAirport.skyId}-${i}`,
        destination:         destAirport.cityName,
        country:             destAirport.countryName,
        dates,
        nights:              dates.nights,
        flight:              cheapestFlight,
        hotel:               bestHotel,
        allAffordableHotels: ranked.slice(0, 3),
        totalCost,
        budgetRemaining:     budget - totalCost,
      });
    } catch (err) {
      if (err.message.includes('403') || err.message.includes('429')) throw err;
      console.warn(`Skipping ${destName} / ${dates.label}:`, err.message);
    }
  }

  return results;
}

export async function findTrips({ origin, destination, budget, checkinDate, checkoutDate }, onProgress = () => {}) {
  onProgress('Resolving your departure airport…');
  let originAirport;
  try {
    originAirport = await resolveAirport(origin);
    if (!MOCK_MODE) await delay(CALL_DELAY_MS);
  } catch (err) {
    const s = err.response?.status;
    if (s === 403) throw new Error(`Air Scraper API 403 Forbidden — go to rapidapi.com and confirm you are subscribed to "Air Scraper".`);
    if (s === 429) throw new Error(`Rate limit hit. Please wait 60 seconds and try again.`);
    throw err;
  }

  let dateWindows;
  if (checkinDate && checkoutDate) {
    dateWindows = [{
      departure: checkinDate,
      return:    checkoutDate,
      nights:    calculateNights(checkinDate, checkoutDate),
      label:     `${checkinDate} – ${checkoutDate}`,
    }];
  } else {
    dateWindows = getAutoDateCombinations().slice(0, 2);
  }

  const hasDestination = destination && destination.trim() !== '';
  let allResults = [];

  if (hasDestination) {
    onProgress(`Searching flights to ${destination.trim()}…`);
    allResults = await searchDestination({
      originAirport,
      destName:    destination.trim(),
      budget,
      dateWindows,
      onProgress,
      tag:         destination.trim(),
    });
  } else {
    const originCity   = originAirport.cityName.toLowerCase();
    const destinations = POPULAR_DESTINATIONS.filter(
      d => !d.toLowerCase().includes(originCity) && !originCity.includes(d.toLowerCase())
    );
    const windowsToTry = dateWindows.slice(0, 2);

    for (let d = 0; d < destinations.length; d++) {
      const destName = destinations[d];
      onProgress(`Exploring ${destName}… (${d + 1}/${destinations.length})`);
      const trips = await searchDestination({
        originAirport, destName, budget,
        dateWindows: windowsToTry, onProgress, tag: destName,
      });
      allResults = [...allResults, ...trips];
    }
  }

  return allResults.sort((a, b) => a.totalCost - b.totalCost);
}
