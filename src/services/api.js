// src/services/api.js
// Single API for flights + hotels + cars — Air Scraper (sky-scrapper.p.rapidapi.com)

export const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
export const API_HOST     = 'sky-scrapper.p.rapidapi.com';
export const BASE_URL     = `https://${API_HOST}`;

export const apiHeaders = () => ({
  'X-RapidAPI-Key':  RAPIDAPI_KEY,
  'X-RapidAPI-Host': API_HOST,
});
