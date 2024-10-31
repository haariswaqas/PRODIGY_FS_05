// SearchPosts.js
import React, { useState } from 'react';

const SearchPosts = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        onSearch(event.target.value); // Pass the search term to the parent component
    };

    return (
        <div className="mb-4">
            <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search posts..."
                className="w-full p-2 border border-gray-300 rounded-md"
            />
        </div>
    );
};

export default SearchPosts;
