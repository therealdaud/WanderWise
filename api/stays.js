// api/stays.js
// Vercel serverless function — geocodes a city name via OpenStreetMap Nominatim
// (free, no key required) then calls Duffel Stays to find accommodations.
// Called by the React frontend as POST /api/stays

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cityName, checkinDate, checkoutDate } = req.body;

  if (!cityName || !checkinDate || !checkoutDate) {
    return res.status(400).json({
      error: 'cityName, checkinDate and checkoutDate are required',
    });
  }

  try {
    // ── Step 1: city name → lat/lng via Nominatim (free, no auth) ────────────
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'WanderWise/1.0 (travel-budget-finder)',
          Accept: 'application/json',
        },
      }
    );

    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ error: `Could not geocode city: ${cityName}` });
    }

    const latitude  = parseFloat(geoData[0].lat);
    const longitude = parseFloat(geoData[0].lon);

    // ── Step 2: search Duffel Stays ───────────────────────────────────────────
    const staysRes = await fetch('https://api.duffel.com/stays/search_results', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DUFFEL_TOKEN}`,
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        data: {
          check_in_date:  checkinDate,
          check_out_date: checkoutDate,
          rooms: 1,
          guests: [{ type: 'adult' }, { type: 'adult' }],
          location: {
            radius: 20,
            geographic_coordinates: { latitude, longitude },
          },
        },
      }),
    });

    const body = await staysRes.json();

    if (!staysRes.ok) {
      return res.status(staysRes.status).json(body);
    }

    res.status(200).json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
