// src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import SearchForm from './components/SearchForm';
import ResultsList from './components/ResultsList';
import './App.css';

async function getAccessToken() {
    try {
        const response = await axios.post("https://test.api.amadeus.com/v1/security/oauth2/token", 
            "grant_type=client_credentials&client_id=kh1H0RceSf1MMkd6Ds6H2E0PMECZD5gf&client_secret=AMyjpIeaMWwbWkKb", 
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error);
        return null;
    }
}


function App() {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (origin, budget) => {
        setIsLoading(true);
        const accessToken = await getAccessToken();
        
        if (!accessToken) {
            console.error("Failed to retrieve access token.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/https://test.api.amadeus.com/v2/shopping/flight-destinations?origin=${origin}&maxPrice=${budget}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });            
            // Adjusting for potential nested structure
            console.log(response.data);
            setResults(response.data.data || []);
        } catch (error) {
            console.error("Error fetching flight data:", error);
            setResults([]); // Clear results on error
        }
        setIsLoading(false);
    };

    return (
        <div className="App">
            <h1>WanderWise: Budget Traveller</h1>
            <SearchForm onSearch={handleSearch} />
            {isLoading ? <p>Loading...</p> : <ResultsList results={results} />}
        </div>
    );
}

export default App;

