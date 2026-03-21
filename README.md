# 🌍 WanderWise

> **Enter your budget. We find the world.**

WanderWise is a travel discovery app that takes your total budget and finds real flight + hotel combinations that fit, no guessing, no manual searching across multiple sites.

---

## ⚠️ Demo Notice

**This is a front-end demo running on mock data.**

The app is fully functional in terms of UI, logic, and budget filtering, but the flight and hotel results you see are **simulated**, not pulled from a live travel API.

### Why?

We integrated with the **Air Scraper API** on RapidAPI (which provides real-time Skyscanner flight data and hotel pricing), but the free tier has strict rate limits that made reliable usage impossible during development. Upgrading to a paid plan or sourcing a production-ready travel data API requires a budget we didn't have at this stage.

The mock data engine (`src/services/mockData.js`) is built to mirror the exact response shape of the real API, so **switching to live data requires changing exactly one line**:

```js
// src/utils/tripFinder.js
const MOCK_MODE = true;  // ← change to false
```

---

## ✨ Features

- 🔍 **Budget-first search** — enter your total spend, we filter everything else
- ✈️ **Flight + hotel combos** — both costs combined must fit within your budget
- 📅 **Flexible dates** — enter specific dates or leave blank to auto-discover the best upcoming weekends and week-long windows
- 🌎 **Destination optional** — leave it blank and we'll explore popular cities for you
- 🏨 **Multiple hotel options** — up to 3 hotel choices per trip, ranked by best value
- 📱 **Fully responsive** — works on mobile and desktop

---

## 🛠️ Tech Stack

- **React 18** — frontend framework
- **Axios** — HTTP client for API calls
- **Air Scraper API** (RapidAPI) — real-time flight & hotel data *(currently mocked due to budget constraints)*
- **CSS** — custom glassmorphism design with no UI library

---

## 🚀 Running Locally

```bash
# 1. Clone the repo
git clone https://github.com/therealdaud/WanderWise.git
cd WanderWise

# 2. Install dependencies
npm install

# 3. Start the app
npm start
```

The app runs at `http://localhost:3000`. No API key needed in demo mode.

---

## 🔑 Enabling Live Data

To connect real flight and hotel data:

1. Sign up at [rapidapi.com](https://rapidapi.com)
2. Subscribe to the **Air Scraper** API
3. Create a `.env.local` file in the project root:

```
REACT_APP_RAPIDAPI_KEY=your_key_here
```

4. In `src/utils/tripFinder.js`, set:

```js
const MOCK_MODE = false;
```

---

## 📁 Project Structure

```
src/
  components/
    SearchForm.js      # Sentence-style search UI
    TripCard.js        # Individual trip result card
    ResultsList.js     # Grid of results
  services/
    api.js             # API config (host, headers)
    flights.js         # Air Scraper flight endpoints
    hotels.js          # Air Scraper hotel endpoints
    mockData.js        # Mock data engine (demo mode)
  utils/
    tripFinder.js      # Core budget-matching algorithm
    dates.js           # Auto date window generator
    rateLimit.js       # Retry + delay helpers
  App.js
  App.css
```

---

## 📌 Roadmap

- [ ] Connect live flight API (pending budget)
- [ ] Car rental integration (Air Scraper supports it)
- [ ] Multi-city search
- [ ] User accounts + saved trips
- [ ] Price alerts

---

*Built with React. Demo mode only — real-time data integration pending.*
