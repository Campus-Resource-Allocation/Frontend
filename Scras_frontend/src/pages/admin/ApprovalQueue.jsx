/**
 * Approval Queue Page
 * Admin approves/rejects room booking requests
 */

import React, { useState, useEffect } from 'react';
import { getBookingRequests, approveBooking, rejectBooking } from '../../services/admin_service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import styles from './ApprovalQueue.module.css';

const ApprovalQueue = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const result = await getBookingRequests();
        if (result.success) {
            setRequests(result.data || []);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        const result = await approveBooking(selectedRequest.booking_id);
        if (result.success) {
            setShowApproveModal(false);
            setSelectedRequest(null);
            fetchRequests();
        } else {
            setError(result.message);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        const result = await rejectBooking(selectedRequest.booking_id);
        if (result.success) {
            setShowRejectModal(false);
            setSelectedRequest(null);
            fetchRequests();
        } else {
            setError(result.message);
        }
    };

    const getFilteredRequests = () => {
        if (activeTab === 'all') return requests;
        return requests.filter(req => req.status?.toLowerCase() === activeTab);
    };

    const getStatusCount = (status) => {
        if (status === 'all') return requests.length;
        return requests.filter(req => req.status?.toLowerCase() === status).length;
    };

    const filteredRequests = getFilteredRequests();

    if (loading) return <LoadingSpinner />;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>Approval Queue</h1>
                    <p>Review and manage room booking requests</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${activeTab === 'all' ? styles.statCardActive : ''}`} onClick={() => setActiveTab('all')}>
                    <span className={styles.statIcon}>📋</span>
                    <span className={styles.statLabel}>Total Requests</span>
                    <span className={styles.statValue}>{getStatusCount('all')}</span>
                </div>
                <div className={`${styles.statCard} ${activeTab === 'pending' ? styles.statCardActive : ''}`} onClick={() => setActiveTab('pending')}>
                    <span className={styles.statIcon}>⏳</span>
                    <span className={styles.statLabel}>Pending</span>
                    <span className={styles.statValue}>{getStatusCount('pending')}</span>
                </div>
                <div className={`${styles.statCard} ${activeTab === 'approved' ? styles.statCardActive : ''}`} onClick={() => setActiveTab('approved')}>
                    <span className={styles.statIcon}>✅</span>
                    <span className={styles.statLabel}>Approved</span>
                    <span className={styles.statValue}>{getStatusCount('approved')}</span>
                </div>
                <div className={`${styles.statCard} ${activeTab === 'rejected' ? styles.statCardActive : ''}`} onClick={() => setActiveTab('rejected')}>
                    <span className={styles.statIcon}>❌</span>
                    <span className={styles.statLabel}>Rejected</span>
                    <span className={styles.statValue}>{getStatusCount('rejected')}</span>
                </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests</h3>
                    <span className={styles.resultsCount}>{filteredRequests.length} results</span>
                </div>

                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>REQUESTER</th>
                            <th>ROOM</th>
                            <th>PURPOSE</th>
                            <th>DATE & TIME</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.map((request, index) => {
                            const colors = ['purple', 'blue', 'green', 'orange', 'pink'];
                            const color = colors[index % colors.length];
                            
                            const statusColorClass = request.status?.toLowerCase() === 'approved' ? 'green' 
                                               : request.status?.toLowerCase() === 'rejected' ? 'pink' 
                                               : 'yellow';

                            const initials = request.Teacher?.name ? request.Teacher.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'RQ';

                            return (
                                <tr key={request.booking_id}>
                                    <td>
                                        <div className={styles.requesterCell}>
                                            <div className={styles.avatar} style={{ background: `var(--card-${color})`, color: `var(--text-${color}-dark, #333)` }}>
                                                {initials}
                                            </div>
                                            <strong>{request.Teacher?.name || `Request #${request.booking_id}`}</strong>
                                        </div>
                                    </td>
                                    <td><strong>{request.Room?.room_number || 'N/A'}</strong></td>
                                    <td>{request.purpose || 'Not specified'}</td>
                                    <td>
                                        <div className={styles.dateTimeCell}>
                                            <span>{request.booking_date ? new Date(request.booking_date).toLocaleDateString() : 'N/A'}</span>
                                            <span className={styles.timeSubtext}>
                                                {request.TimeSlot?.start_time && request.TimeSlot?.end_time
                                                    ? `${request.TimeSlot.start_time} - ${request.TimeSlot.end_time}`
                                                    : 'Not specified'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.badge} style={{ background: `var(--card-${statusColorClass})`, color: `var(--text-${statusColorClass}-dark)` }}>
                                            <span className={styles.statusDot}></span> {request.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        {request.status?.toLowerCase() === 'pending' ? (
                                            <div className={styles.actionButtons}>
                                                <button
                                                    className={styles.approveBtn}
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowApproveModal(true);
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className={styles.rejectBtn}
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowRejectModal(true);
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={styles.processedText}>Processed</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredRequests.length === 0 && (
                    <div className={styles.emptyState}>
                        No {activeTab} requests found
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={handleApprove}
                title="Approve Booking"
                message={`Are you sure you want to approve this booking request for ${selectedRequest?.Room?.room_number}?`}
                confirmText="Approve"
                confirmVariant="primary"
            />

            <ConfirmModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={handleReject}
                title="Reject Booking"
                message={`Are you sure you want to reject this booking request for ${selectedRequest?.Room?.room_number}?`}
                confirmText="Reject"
                confirmVariant="danger"
            />
        </div>
    );
};

export default ApprovalQueue;