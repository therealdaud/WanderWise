// src/utils/tripFinder.js

import {
  resolveAirport,
  searchFlights,
  getCheapestFlight,
} from '../services/flights';

import {
  resolveHotelDestination,
  searchHotels,
} from '../services/hotels';

import { getAutoDateCombinations, calculateNights } from './dates';

const POPULAR_DESTINATIONS = [
  'New York', 'Miami', 'Los Angeles', 'Las Vegas', 'Orlando',
  'Chicago', 'Cancun', 'London', 'Paris', 'Tokyo',
];

const MOOD_DESTINATIONS = {
  relax:     ['Cancun', 'Miami', 'Orlando', 'Los Angeles', 'Nashville'],
  adventure: ['Denver', 'Seattle', 'Chicago', 'New York', 'Portland'],
  party:     ['Las Vegas', 'Miami', 'New York', 'New Orleans', 'Chicago'],
  culture:   ['New York', 'Chicago', 'London', 'Paris', 'Tokyo'],
  food:      ['New York', 'Chicago', 'New Orleans', 'Los Angeles', 'Tokyo'],
  nature:    ['Denver', 'Seattle', 'Portland', 'Nashville', 'Orlando'],
};

async function searchDestination({ originAirport, destName, budget, dateWindows, onProgress, tag }) {
  let destAirport, hotelDest;

  try {
    destAirport = await resolveAirport(destName);
  } catch (err) {
    console.warn(`Could not resolve destination "${destName}":`, err.message);
    return { results: [], minCostSeen: null };
  }

  try {
    hotelDest = await resolveHotelDestination(destAirport.cityName);
  } catch (err) {
    console.warn(`Could not resolve hotel destination for "${destName}":`, err.message);
    return { results: [], minCostSeen: null };
  }

  const results    = [];
  let   minCostSeen = null;

  for (let i = 0; i < dateWindows.length; i++) {
    const dates = dateWindows[i];
    onProgress(`${tag} — checking ${dates.label}… (${i + 1}/${dateWindows.length})`);

    try {
      const offers = await searchFlights({
        originIata:      originAirport.iataCode,
        destinationIata: destAirport.iataCode,
        departureDate:   dates.departure,
        returnDate:      dates.return,
      });

      const cheapestFlight = getCheapestFlight(offers);
      if (!cheapestFlight) continue;

      const hotels = await searchHotels({
        entityId:     hotelDest.entityId,
        checkinDate:  dates.departure,
        checkoutDate: dates.return,
      });

      if (hotels.length === 0) continue;

      const cheapestPossible = cheapestFlight.price + hotels[0].totalPrice;
      if (minCostSeen === null || cheapestPossible < minCostSeen) {
        minCostSeen = cheapestPossible;
      }

      const flightBudget     = budget - cheapestFlight.price;
      if (flightBudget <= 0) continue;

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
        id:                  `${dates.departure}-${destAirport.iataCode}-${i}`,
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
      console.warn(`Skipping ${destName} / ${dates.label}:`, err.message);
    }
  }

  return { results, minCostSeen };
}

export async function findTrips(
  { origin, destination, budget, checkinDate, checkoutDate, mood },
  onProgress = () => {}
) {
  onProgress('Resolving your departure airport…');

  let originAirport;
  try {
    originAirport = await resolveAirport(origin);
  } catch (err) {
    throw new Error(`Could not find airport for "${origin}". Try a city name or IATA code.`);
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
  let   allResults     = [];
  let   globalMinCost  = null;

  if (hasDestination) {
    onProgress(`Searching flights to ${destination.trim()}…`);
    const { results, minCostSeen } = await searchDestination({
      originAirport,
      destName:    destination.trim(),
      budget,
      dateWindows,
      onProgress,
      tag: destination.trim(),
    });
    allResults    = results;
    globalMinCost = minCostSeen;
  } else {
    const originCity   = originAirport.cityName.toLowerCase();

    // Use mood-specific destinations if a mood is provided, otherwise popular list
    const moodList     = (mood && MOOD_DESTINATIONS[mood]) ? MOOD_DESTINATIONS[mood] : POPULAR_DESTINATIONS;
    const destinations = moodList.filter(
      d => !d.toLowerCase().includes(originCity) && !originCity.includes(d.toLowerCase())
    );

    for (let d = 0; d < destinations.length; d++) {
      const destName = destinations[d];
      onProgress(`Exploring ${destName}… (${d + 1}/${destinations.length})`);
      const { results, minCostSeen } = await searchDestination({
        originAirport, destName, budget,
        dateWindows: dateWindows.slice(0, 2), onProgress, tag: destName,
      });
      allResults = [...allResults, ...results];
      if (minCostSeen !== null && (globalMinCost === null || minCostSeen < globalMinCost)) {
        globalMinCost = minCostSeen;
      }
    }
  }

  return {
    trips:        allResults.sort((a, b) => a.totalCost - b.totalCost),
    minCostFound: globalMinCost,
  };
}
