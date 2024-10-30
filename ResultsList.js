// src/components/ResultsList.js

import React from 'react';

function ResultsList({ results }) {
    if (results.length === 0) {
        return <p>No destinations found within the budget.</p>;
    }

    return (
        <div>
            <h2>Available Destinations</h2>
            <ul>
                {results.map((destination, index) => (
                    <li key={index}>
                        {destination.destination} - ${destination.price} (Airline: {destination.airline})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ResultsList;
