/**
 * Loading Spinner Component
 * Shows loading animation with optional text
 */

import React from 'react';

const LoadingSpinner = ({ size = "md", text = "Loading...", fullPage = false }) => {
    const sizeClass = `spinner-${size}`;

    const SpinnerContent = () => (
        <div className="spinner-container">
            <div className={`spinner ${sizeClass}`}>
                <div className="spinner-circle"></div>
                <div className="spinner-circle"></div>
                <div className="spinner-circle"></div>
            </div>
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="spinner-fullpage">
                <SpinnerContent />
            </div>
        );
    }

    return <SpinnerContent />;
};

export default LoadingSpinner;