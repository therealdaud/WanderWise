// api/flights.js
// Two-step Duffel flight search:
//   1. POST /air/offer_requests  — creates the search, triggers airline polling
//   2. GET  /air/offers          — fetches results sorted cheapest-first (server-side)
// This gives Duffel time to finish polling all connected airlines before we
// read results, and guarantees server-side price-ascending order.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { origin, destination, departureDate, returnDate } = req.body;
  if (!origin || !destination || !departureDate || !returnDate) {
    return res.status(400).json({ error: 'origin, destination, departureDate and returnDate are required' });
  }

  const headers = {
    Authorization:  `Bearer ${process.env.DUFFEL_TOKEN}`,
    'Content-Type': 'application/json',
    'Duffel-Version': 'v2',
    Accept: 'application/json',
  };

  try {
    // ── Step 1: create offer request (no return_offers — let Duffel poll fully) ──
    const requestRes = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          slices: [
            { origin, destination, departure_date: departureDate },
            { origin: destination, destination: origin, departure_date: returnDate },
          ],
          passengers:  [{ type: 'adult' }],
          cabin_class: 'economy',
        },
      }),
    });

    const requestBody = await requestRes.json();
    if (!requestRes.ok) return res.status(requestRes.status).json(requestBody);

    const offerRequestId = requestBody.data?.id;
    if (!offerRequestId) return res.status(500).json({ error: 'No offer_request_id returned' });

    // ── Step 2: fetch offers sorted cheapest-first, up to 50 results ──────────
    const offersRes = await fetch(
      `https://api.duffel.com/air/offers?offer_request_id=${offerRequestId}&sort=total_amount&limit=50`,
      { headers }
    );

    const offersBody = await offersRes.json();
    if (!offersRes.ok) return res.status(offersRes.status).json(offersBody);

    // Return in the same shape as before so the frontend needs no changes
    res.status(200).json({ data: { offers: offersBody.data ?? [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
