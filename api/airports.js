// api/airports.js
// Vercel serverless function — proxies Duffel places/suggestions endpoint.
// Called by the React frontend as GET /api/airports?query=Tampa

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'query parameter is required' });
  }

  try {
    const response = await fetch(
      `https://api.duffel.com/places/suggestions?query=${encodeURIComponent(query.trim())}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DUFFEL_TOKEN}`,
          'Duffel-Version': 'v2',
          Accept: 'application/json',
        },
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
