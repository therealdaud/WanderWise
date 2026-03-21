// src/services/mockData.js
// Realistic mock data so the app works end-to-end without hitting any live API.
// Swap MOCK_MODE to false in tripFinder.js once you have working API credentials.

import { delay } from '../utils/rateLimit';

// ── Airport lookup ────────────────────────────────────────────────────────────
const AIRPORTS = {
  // Florida
  tampa: { skyId: 'TPA', entityId: 'TPA-sky', cityName: 'Tampa', countryName: 'United States' },
  tpa:   { skyId: 'TPA', entityId: 'TPA-sky', cityName: 'Tampa', countryName: 'United States' },
  miami: { skyId: 'MIA', entityId: 'MIA-sky', cityName: 'Miami', countryName: 'United States' },
  mia:   { skyId: 'MIA', entityId: 'MIA-sky', cityName: 'Miami', countryName: 'United States' },
  orlando: { skyId: 'MCO', entityId: 'MCO-sky', cityName: 'Orlando', countryName: 'United States' },
  mco:     { skyId: 'MCO', entityId: 'MCO-sky', cityName: 'Orlando', countryName: 'United States' },
  // Georgia
  atlanta: { skyId: 'ATL', entityId: 'ATL-sky', cityName: 'Atlanta', countryName: 'United States' },
  atl:     { skyId: 'ATL', entityId: 'ATL-sky', cityName: 'Atlanta', countryName: 'United States' },
  // New York
  'new york':      { skyId: 'JFK', entityId: 'JFK-sky', cityName: 'New York', countryName: 'United States' },
  'new york city': { skyId: 'JFK', entityId: 'JFK-sky', cityName: 'New York', countryName: 'United States' },
  nyc: { skyId: 'JFK', entityId: 'JFK-sky', cityName: 'New York', countryName: 'United States' },
  jfk: { skyId: 'JFK', entityId: 'JFK-sky', cityName: 'New York', countryName: 'United States' },
  // California
  'los angeles': { skyId: 'LAX', entityId: 'LAX-sky', cityName: 'Los Angeles', countryName: 'United States' },
  la:  { skyId: 'LAX', entityId: 'LAX-sky', cityName: 'Los Angeles', countryName: 'United States' },
  lax: { skyId: 'LAX', entityId: 'LAX-sky', cityName: 'Los Angeles', countryName: 'United States' },
  'san francisco': { skyId: 'SFO', entityId: 'SFO-sky', cityName: 'San Francisco', countryName: 'United States' },
  sfo: { skyId: 'SFO', entityId: 'SFO-sky', cityName: 'San Francisco', countryName: 'United States' },
  // Nevada
  'las vegas': { skyId: 'LAS', entityId: 'LAS-sky', cityName: 'Las Vegas', countryName: 'United States' },
  las: { skyId: 'LAS', entityId: 'LAS-sky', cityName: 'Las Vegas', countryName: 'United States' },
  // Illinois
  chicago: { skyId: 'ORD', entityId: 'ORD-sky', cityName: 'Chicago', countryName: 'United States' },
  ord:     { skyId: 'ORD', entityId: 'ORD-sky', cityName: 'Chicago', countryName: 'United States' },
  // Colorado
  denver: { skyId: 'DEN', entityId: 'DEN-sky', cityName: 'Denver', countryName: 'United States' },
  den:    { skyId: 'DEN', entityId: 'DEN-sky', cityName: 'Denver', countryName: 'United States' },
  // Washington
  seattle: { skyId: 'SEA', entityId: 'SEA-sky', cityName: 'Seattle', countryName: 'United States' },
  sea:     { skyId: 'SEA', entityId: 'SEA-sky', cityName: 'Seattle', countryName: 'United States' },
  // Massachusetts
  boston: { skyId: 'BOS', entityId: 'BOS-sky', cityName: 'Boston', countryName: 'United States' },
  bos:    { skyId: 'BOS', entityId: 'BOS-sky', cityName: 'Boston', countryName: 'United States' },
  // International
  cancun: { skyId: 'CUN', entityId: 'CUN-sky', cityName: 'Cancun', countryName: 'Mexico' },
  cun:    { skyId: 'CUN', entityId: 'CUN-sky', cityName: 'Cancun', countryName: 'Mexico' },
  london: { skyId: 'LHR', entityId: 'LHR-sky', cityName: 'London', countryName: 'United Kingdom' },
  lhr:    { skyId: 'LHR', entityId: 'LHR-sky', cityName: 'London', countryName: 'United Kingdom' },
  paris:  { skyId: 'CDG', entityId: 'CDG-sky', cityName: 'Paris', countryName: 'France' },
  cdg:    { skyId: 'CDG', entityId: 'CDG-sky', cityName: 'Paris', countryName: 'France' },
  tokyo:  { skyId: 'NRT', entityId: 'NRT-sky', cityName: 'Tokyo', countryName: 'Japan' },
  nrt:    { skyId: 'NRT', entityId: 'NRT-sky', cityName: 'Tokyo', countryName: 'Japan' },
};

// Round-trip economy base prices (USD) from any US city
const BASE_FLIGHT_PRICE = {
  TPA: 160, MIA: 180, MCO: 150,
  ATL: 210, JFK: 290, LAX: 380, SFO: 400,
  LAS: 340, ORD: 270, DEN: 310, SEA: 390, BOS: 280,
  CUN: 360, LHR: 820, CDG: 860, NRT: 1050,
};

const AIRLINES = [
  'Delta Air Lines', 'American Airlines', 'United Airlines',
  'Southwest Airlines', 'JetBlue Airways', 'Spirit Airlines',
  'Alaska Airlines', 'Frontier Airlines',
];

// Hotel templates per city
const HOTEL_TEMPLATES = {
  ATL: [
    { name: 'Marriott Marquis Atlanta',       stars: 4, ratingWord: 'Excellent',  rating: 8.8, pricePerNight: 149 },
    { name: 'Hilton Atlanta',                  stars: 4, ratingWord: 'Very Good',  rating: 8.3, pricePerNight: 129 },
    { name: 'Hyatt Regency Atlanta',           stars: 4, ratingWord: 'Excellent',  rating: 9.0, pricePerNight: 169 },
    { name: 'Hampton Inn Downtown Atlanta',    stars: 3, ratingWord: 'Good',       rating: 7.8, pricePerNight:  99 },
    { name: 'Holiday Inn Atlanta',             stars: 3, ratingWord: 'Good',       rating: 7.5, pricePerNight:  89 },
    { name: 'Four Seasons Atlanta',            stars: 5, ratingWord: 'Exceptional',rating: 9.5, pricePerNight: 389 },
    { name: 'Westin Peachtree Plaza',          stars: 4, ratingWord: 'Very Good',  rating: 8.4, pricePerNight: 139 },
    { name: 'Budget Inn Midtown',              stars: 2, ratingWord: 'Okay',       rating: 6.5, pricePerNight:  65 },
  ],
  MIA: [
    { name: 'Fontainebleau Miami Beach',       stars: 5, ratingWord: 'Exceptional',rating: 9.3, pricePerNight: 420 },
    { name: 'InterContinental Miami',          stars: 4, ratingWord: 'Excellent',  rating: 8.9, pricePerNight: 189 },
    { name: 'AC Hotel Miami Wynwood',          stars: 4, ratingWord: 'Very Good',  rating: 8.5, pricePerNight: 159 },
    { name: 'Hampton Inn Miami Airport',       stars: 3, ratingWord: 'Good',       rating: 7.8, pricePerNight:  99 },
    { name: 'Courtyard Miami Downtown',        stars: 3, ratingWord: 'Good',       rating: 7.9, pricePerNight: 119 },
    { name: 'South Beach Plaza Hotel',         stars: 2, ratingWord: 'Okay',       rating: 6.8, pricePerNight:  75 },
    { name: 'Loews Miami Beach Hotel',         stars: 4, ratingWord: 'Excellent',  rating: 8.7, pricePerNight: 229 },
    { name: 'Novotel Miami Brickell',          stars: 4, ratingWord: 'Very Good',  rating: 8.2, pricePerNight: 145 },
  ],
  JFK: [
    { name: 'The Standard High Line',          stars: 4, ratingWord: 'Excellent',  rating: 8.8, pricePerNight: 249 },
    { name: 'Marriott New York Downtown',      stars: 4, ratingWord: 'Very Good',  rating: 8.4, pricePerNight: 219 },
    { name: 'Row NYC Hotel',                   stars: 3, ratingWord: 'Good',       rating: 7.6, pricePerNight: 139 },
    { name: 'Pod 51 Hotel',                    stars: 3, ratingWord: 'Good',       rating: 7.8, pricePerNight: 119 },
    { name: 'The Plaza Hotel',                 stars: 5, ratingWord: 'Exceptional',rating: 9.6, pricePerNight: 699 },
    { name: 'citizenM New York Times Square',  stars: 4, ratingWord: 'Excellent',  rating: 8.9, pricePerNight: 189 },
    { name: 'Hampton Inn Times Square',        stars: 3, ratingWord: 'Good',       rating: 7.9, pricePerNight: 159 },
    { name: 'LaGuardia Airport Marriott',      stars: 3, ratingWord: 'Okay',       rating: 7.2, pricePerNight:  99 },
  ],
  LAX: [
    { name: 'The Ritz-Carlton LA Live',        stars: 5, ratingWord: 'Exceptional',rating: 9.4, pricePerNight: 499 },
    { name: 'Loews Hollywood Hotel',           stars: 4, ratingWord: 'Excellent',  rating: 8.7, pricePerNight: 199 },
    { name: 'Sheraton Grand LA',               stars: 4, ratingWord: 'Very Good',  rating: 8.3, pricePerNight: 179 },
    { name: 'Courtyard LAX',                   stars: 3, ratingWord: 'Good',       rating: 7.7, pricePerNight: 129 },
    { name: 'Holiday Inn LAX',                 stars: 3, ratingWord: 'Good',       rating: 7.5, pricePerNight: 109 },
    { name: 'The LINE Hotel LA',               stars: 4, ratingWord: 'Excellent',  rating: 8.8, pricePerNight: 219 },
    { name: 'Budget Motel Santa Monica',       stars: 2, ratingWord: 'Okay',       rating: 6.4, pricePerNight:  79 },
    { name: 'Ace Hotel Downtown LA',           stars: 4, ratingWord: 'Very Good',  rating: 8.5, pricePerNight: 189 },
  ],
  LAS: [
    { name: 'The Venetian Resort',             stars: 5, ratingWord: 'Exceptional',rating: 9.2, pricePerNight: 189 },
    { name: 'MGM Grand Hotel & Casino',        stars: 4, ratingWord: 'Excellent',  rating: 8.6, pricePerNight: 119 },
    { name: 'Caesars Palace',                  stars: 5, ratingWord: 'Exceptional',rating: 9.0, pricePerNight: 159 },
    { name: 'Park MGM Las Vegas',              stars: 4, ratingWord: 'Very Good',  rating: 8.4, pricePerNight: 109 },
    { name: 'Luxor Hotel & Casino',            stars: 3, ratingWord: 'Good',       rating: 7.6, pricePerNight:  69 },
    { name: 'Excalibur Hotel & Casino',        stars: 3, ratingWord: 'Good',       rating: 7.3, pricePerNight:  59 },
    { name: 'Wynn Las Vegas',                  stars: 5, ratingWord: 'Exceptional',rating: 9.5, pricePerNight: 279 },
    { name: 'Courtyard Las Vegas Convention',  stars: 3, ratingWord: 'Good',       rating: 7.8, pricePerNight:  89 },
  ],
  MCO: [
    { name: 'Walt Disney World Swan',          stars: 4, ratingWord: 'Excellent',  rating: 8.7, pricePerNight: 199 },
    { name: 'Loews Royal Pacific Resort',      stars: 4, ratingWord: 'Excellent',  rating: 8.9, pricePerNight: 229 },
    { name: 'Hampton Inn Orlando Airport',     stars: 3, ratingWord: 'Good',       rating: 7.9, pricePerNight:  99 },
    { name: 'Hyatt Place Orlando Airport',     stars: 3, ratingWord: 'Very Good',  rating: 8.1, pricePerNight: 109 },
    { name: 'Rosen Inn International',         stars: 2, ratingWord: 'Okay',       rating: 7.0, pricePerNight:  69 },
    { name: 'Marriott World Center Orlando',   stars: 5, ratingWord: 'Exceptional',rating: 9.1, pricePerNight: 299 },
    { name: 'Holiday Inn Orlando',             stars: 3, ratingWord: 'Good',       rating: 7.6, pricePerNight:  89 },
    { name: 'Hilton Orlando Buena Vista',      stars: 4, ratingWord: 'Very Good',  rating: 8.3, pricePerNight: 149 },
  ],
  ORD: [
    { name: 'The Langham Chicago',             stars: 5, ratingWord: 'Exceptional',rating: 9.5, pricePerNight: 349 },
    { name: 'Marriott Chicago Magnificent Mile',stars: 4,ratingWord: 'Excellent',  rating: 8.7, pricePerNight: 179 },
    { name: 'Hampton Inn Chicago Downtown',    stars: 3, ratingWord: 'Good',       rating: 7.9, pricePerNight: 119 },
    { name: 'Radisson Blu Aqua Hotel',         stars: 4, ratingWord: 'Very Good',  rating: 8.5, pricePerNight: 159 },
    { name: 'HI Chicago Hostel',               stars: 1, ratingWord: 'Good',       rating: 8.0, pricePerNight:  49 },
    { name: 'Hyatt Regency Chicago',           stars: 4, ratingWord: 'Excellent',  rating: 8.8, pricePerNight: 189 },
    { name: 'Hilton Chicago O\'Hare Airport',  stars: 3, ratingWord: 'Good',       rating: 7.5, pricePerNight: 109 },
    { name: 'Freehand Chicago',                stars: 3, ratingWord: 'Very Good',  rating: 8.2, pricePerNight:  99 },
  ],
  CUN: [
    { name: 'Secrets Playa Mujeres',           stars: 5, ratingWord: 'Exceptional',rating: 9.4, pricePerNight: 299 },
    { name: 'Hotel Krystal Grand Cancun',      stars: 4, ratingWord: 'Excellent',  rating: 8.7, pricePerNight: 149 },
    { name: 'Hyatt Ziva Cancun',               stars: 5, ratingWord: 'Exceptional',rating: 9.1, pricePerNight: 259 },
    { name: 'Grand Oasis Cancun',              stars: 4, ratingWord: 'Very Good',  rating: 8.3, pricePerNight: 119 },
    { name: 'Ibis Cancun Centro',              stars: 2, ratingWord: 'Good',       rating: 7.5, pricePerNight:  59 },
    { name: 'Fiesta Americana Coral Beach',    stars: 5, ratingWord: 'Exceptional',rating: 9.3, pricePerNight: 279 },
    { name: 'Holiday Inn Cancun Arenas',       stars: 3, ratingWord: 'Good',       rating: 7.7, pricePerNight:  89 },
    { name: 'Ambiance Suites Cancun',          stars: 3, ratingWord: 'Very Good',  rating: 8.1, pricePerNight:  99 },
  ],
  LHR: [
    { name: 'The Savoy London',                stars: 5, ratingWord: 'Exceptional',rating: 9.6, pricePerNight: 599 },
    { name: 'Marriott London Grosvenor Square',stars: 4, ratingWord: 'Excellent',  rating: 8.8, pricePerNight: 249 },
    { name: 'citizenM London Shoreditch',      stars: 4, ratingWord: 'Excellent',  rating: 8.9, pricePerNight: 179 },
    { name: 'Premier Inn London City',         stars: 3, ratingWord: 'Good',       rating: 7.9, pricePerNight: 119 },
    { name: 'ibis London Heathrow',            stars: 2, ratingWord: 'Good',       rating: 7.5, pricePerNight:  89 },
    { name: 'Hilton London Metropole',         stars: 4, ratingWord: 'Very Good',  rating: 8.4, pricePerNight: 199 },
    { name: 'Hub by Premier Inn London',       stars: 3, ratingWord: 'Good',       rating: 7.8, pricePerNight: 109 },
    { name: 'The Ned London',                  stars: 5, ratingWord: 'Exceptional',rating: 9.3, pricePerNight: 399 },
  ],
  CDG: [
    { name: 'The Ritz Paris',                  stars: 5, ratingWord: 'Exceptional',rating: 9.7, pricePerNight: 999 },
    { name: 'Marriott Paris Champs-Élysées',   stars: 5, ratingWord: 'Exceptional',rating: 9.2, pricePerNight: 449 },
    { name: 'Ibis Paris Tour Eiffel',          stars: 2, ratingWord: 'Good',       rating: 7.6, pricePerNight:  99 },
    { name: 'Hotel du Louvre',                 stars: 4, ratingWord: 'Excellent',  rating: 8.7, pricePerNight: 219 },
    { name: 'citizenM Paris Gare de Lyon',     stars: 4, ratingWord: 'Excellent',  rating: 8.8, pricePerNight: 159 },
    { name: 'Pullman Paris Tour Eiffel',       stars: 4, ratingWord: 'Very Good',  rating: 8.5, pricePerNight: 229 },
    { name: 'Generator Hostel Paris',          stars: 1, ratingWord: 'Good',       rating: 7.8, pricePerNight:  45 },
    { name: 'Novotel Paris Centre Tour Eiffel',stars: 4, ratingWord: 'Very Good',  rating: 8.3, pricePerNight: 189 },
  ],
  NRT: [
    { name: 'Park Hyatt Tokyo',                stars: 5, ratingWord: 'Exceptional',rating: 9.5, pricePerNight: 549 },
    { name: 'Shinjuku Granbell Hotel',         stars: 4, ratingWord: 'Excellent',  rating: 8.7, pricePerNight: 189 },
    { name: 'APA Hotel Shinjuku',              stars: 3, ratingWord: 'Good',       rating: 7.9, pricePerNight: 109 },
    { name: 'Shibuya Stream Excel Hotel Tokyu',stars: 4, ratingWord: 'Very Good',  rating: 8.5, pricePerNight: 169 },
    { name: 'Dormy Inn Asakusa',               stars: 3, ratingWord: 'Good',       rating: 8.0, pricePerNight:  99 },
    { name: 'Andaz Tokyo Toranomon Hills',     stars: 5, ratingWord: 'Exceptional',rating: 9.4, pricePerNight: 429 },
    { name: 'Capsule Hotel Shinjuku',          stars: 1, ratingWord: 'Unique',     rating: 7.5, pricePerNight:  45 },
    { name: 'Hilton Tokyo Narita Airport',     stars: 4, ratingWord: 'Very Good',  rating: 8.2, pricePerNight: 139 },
  ],
};

// Generic fallback hotels for any city not listed above
function genericHotels(cityName) {
  return [
    { name: `${cityName} Grand Hotel`,      stars: 4, ratingWord: 'Excellent',  rating: 8.6, pricePerNight: 159 },
    { name: `Marriott ${cityName}`,         stars: 4, ratingWord: 'Very Good',  rating: 8.3, pricePerNight: 139 },
    { name: `Hampton Inn ${cityName}`,      stars: 3, ratingWord: 'Good',       rating: 7.8, pricePerNight:  99 },
    { name: `Hilton ${cityName}`,           stars: 4, ratingWord: 'Excellent',  rating: 8.7, pricePerNight: 169 },
    { name: `Holiday Inn ${cityName}`,      stars: 3, ratingWord: 'Good',       rating: 7.5, pricePerNight:  85 },
    { name: `Budget Inn ${cityName}`,       stars: 2, ratingWord: 'Okay',       rating: 6.5, pricePerNight:  59 },
    { name: `Hyatt Place ${cityName}`,      stars: 3, ratingWord: 'Very Good',  rating: 8.1, pricePerNight: 109 },
    { name: `${cityName} Boutique Suites`,  stars: 4, ratingWord: 'Excellent',  rating: 8.9, pricePerNight: 189 },
  ];
}

// ── Seeded variance so same route always gives same price ─────────────────────
function pseudoRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  return (((h >>> 0) % 30) - 15); // returns -15 to +14
}

function flightPrice(originSkyId, destinationSkyId, departureDate) {
  const base    = BASE_FLIGHT_PRICE[destinationSkyId] ?? 300;
  const variance = pseudoRandom(originSkyId + destinationSkyId + departureDate);
  return Math.max(80, base + variance);
}

// ── Public mock functions (same signatures as real service functions) ──────────

/** Resolve any text to an airport — falls back gracefully for unknown cities */
export async function mockResolveAirport(query) {
  await delay(300);
  const key    = query.trim().toLowerCase();
  const airport = AIRPORTS[key];
  if (airport) return { ...airport };

  // Fallback: capitalise and create a plausible entry
  const cityName = query.trim().replace(/\b\w/g, c => c.toUpperCase());
  const skyId    = query.trim().slice(0, 3).toUpperCase();
  return { skyId, entityId: `${skyId}-sky`, cityName, countryName: 'United States' };
}

/** Return mock itineraries in the same shape getCheapestFlight() expects */
export async function mockSearchFlights({
  originSkyId, destinationSkyId, departureDate, returnDate,
}) {
  await delay(400);
  const basePrice = flightPrice(originSkyId, destinationSkyId, departureDate);
  const depDate   = new Date(departureDate + 'T06:00:00');
  const retDate   = new Date((returnDate ?? departureDate) + 'T17:00:00');

  return [1, 2, 3].map((i) => {
    const price    = basePrice + (i - 1) * 28;
    const airline  = AIRLINES[(originSkyId.charCodeAt(0) + i) % AIRLINES.length];
    const stops    = i === 3 ? 1 : 0;
    const duration = 90 + stops * 60 + (i - 1) * 15;

    const depTime = new Date(depDate); depTime.setHours(6 + i * 2);
    const arrTime = new Date(depTime); arrTime.setMinutes(arrTime.getMinutes() + duration);
    const retDep  = new Date(retDate); retDep.setHours(15 + i);
    const retArr  = new Date(retDep);  retArr.setMinutes(retArr.getMinutes() + duration);

    return {
      id:    `mock-${originSkyId}-${destinationSkyId}-${i}`,
      price: { raw: price, formatted: `$${price}` },
      legs:  [
        {
          carriers:          { marketing: [{ name: airline }] },
          stopCount:         stops,
          durationInMinutes: duration,
          departure:         depTime.toISOString(),
          arrival:           arrTime.toISOString(),
        },
        {
          carriers:          { marketing: [{ name: airline }] },
          stopCount:         stops,
          durationInMinutes: duration,
          departure:         retDep.toISOString(),
          arrival:           retArr.toISOString(),
        },
      ],
    };
  });
}

/** Resolve city → hotel destination entity */
export async function mockResolveHotelDestination(cityName) {
  await delay(200);
  const key = cityName.trim().toLowerCase();
  const ap  = AIRPORTS[key];
  return {
    entityId: ap ? ap.entityId : `${cityName.slice(0, 3).toUpperCase()}-sky`,
    name:     cityName,
  };
}

/** Return mock hotels for the destination */
export async function mockSearchHotels({ entityId, checkinDate, checkoutDate }) {
  await delay(400);

  const skyId   = entityId.replace('-sky', '');
  const nights  = Math.max(
    1,
    Math.round(
      (new Date(checkoutDate + 'T00:00:00') - new Date(checkinDate + 'T00:00:00'))
        / (1000 * 60 * 60 * 24)
    )
  );

  const templates = HOTEL_TEMPLATES[skyId] ?? genericHotels(skyId);

  return templates.map((h, idx) => ({
    id:         `hotel-${skyId}-${idx}`,
    name:       h.name,
    address:    `${100 + idx * 10} Main Street, ${skyId}`,
    totalPrice: Math.round(h.pricePerNight * nights),
    currency:   'USD',
    rating:     h.rating,
    ratingWord: h.ratingWord,
    stars:      h.stars,
    photo:      null,
  }));
}
