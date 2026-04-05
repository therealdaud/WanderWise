// api/flights.js
// Vercel serverless function — creates a Duffel round-trip offer request and
// returns the offers in a single response (return_offers=true).
// Called by the React frontend as POST /api/flights

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origin, destination, departureDate, returnDate } = req.body;

  if (!origin || !destination || !departureDate || !returnDate) {
    return res.status(400).json({
      error: 'origin, destination, departureDate and returnDate are required',
    });
  }

  try {
    const response = await fetch(
      'https://api.duffel.com/air/offer_requests?return_offers=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.DUFFEL_TOKEN}`,
          'Content-Type': 'application/json',
          'Duffel-Version': 'v2',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          data: {
            slices: [
              { origin, destination, departure_date: departureDate },
              { origin: destination, destination: origin, departure_date: returnDate },
            ],
            passengers: [{ type: 'adult' }],
            cabin_class: 'economy',
          },
        }),
      }
    );

    const body = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(body);
    }

    res.status(200).json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
