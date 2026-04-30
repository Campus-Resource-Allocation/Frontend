/**
 * Reusable Search Bar Component
 * Features: Debounced search, clear button, optional filters
 */

import React, { useState, useEffect, useCallback } from 'react';

const SearchBar = ({
    placeholder = "Search...",
    onSearch,
    debounceMs = 300,
    showClear = true,
    className = ""
}) => {
    const [value, setValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(value);
            }
            setIsTyping(false);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [value, debounceMs, onSearch]);

    const handleChange = (e) => {
        setValue(e.target.value);
        setIsTyping(true);
    };

    const handleClear = () => {
        setValue('');
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <div className={`search-bar ${className}`}>
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="search-input"
                />
                {isTyping && <span className="typing-indicator">...</span>}
                {showClear && value && (
                    <button type="button" onClick={handleClear} className="clear-btn">
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;