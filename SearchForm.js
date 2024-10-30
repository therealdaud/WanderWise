// src/components/SearchForm.js

import React, { useState } from 'react';

function SearchForm({ onSearch }) {
    const [origin, setOrigin] = useState('');
    const [budget, setBudget] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(origin, budget);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Origin:
                <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g., JFK" required />
            </label>
            <label>
                Budget:
                <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., 300" required />
            </label>
            <button type="submit">Search</button>
        </form>
    );
}

export default SearchForm;
