/**
 * Status Badge Component
 * Displays colored status badges for various states
 */

import React from 'react';

const StatusBadge = ({ status, size = "md", showIcon = true }) => {
    const getStatusConfig = () => {
        const statusMap = {
            // Active states
            'active': { class: 'status-active', icon: '●', label: 'Active' },
            'available': { class: 'status-available', icon: '●', label: 'Available' },
            'approved': { class: 'status-approved', icon: '✓', label: 'Approved' },

            // Warning states
            'pending': { class: 'status-pending', icon: '◐', label: 'Pending' },
            'on leave': { class: 'status-on-leave', icon: '○', label: 'On Leave' },
            'maintenance': { class: 'status-maintenance', icon: '⚠', label: 'Maintenance' },

            // Danger states
            'occupied': { class: 'status-occupied', icon: '●', label: 'Occupied' },
            'rejected': { class: 'status-rejected', icon: '✗', label: 'Rejected' },
            'inactive': { class: 'status-inactive', icon: '○', label: 'Inactive' },

            // Info states
            'recording': { class: 'status-recording', icon: '●', label: 'Recording' },
            'scheduled': { class: 'status-scheduled', icon: '●', label: 'Scheduled' },
        };

        const key = status?.toLowerCase() || 'inactive';
        return statusMap[key] || { class: 'status-default', icon: '●', label: status || 'Unknown' };
    };

    const config = getStatusConfig();
    const sizeClass = `status-${size}`;

    return (
        <span className={`status-badge ${config.class} ${sizeClass}`}>
            {showIcon && <span className="status-icon">{config.icon}</span>}
            <span className="status-text">{config.label}</span>
        </span>
    );
};

export default StatusBadge;