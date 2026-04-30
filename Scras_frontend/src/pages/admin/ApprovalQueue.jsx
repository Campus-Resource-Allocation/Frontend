/**
 * Approval Queue Page
 * Admin approves/rejects room booking requests
 */

import React, { useState, useEffect } from 'react';
import { getBookingRequests, approveBooking, rejectBooking } from '../../services/admin_service';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';

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
        <div className="approvals-page">
            <div className="page-header">
                <div className="page-title">
                    <h1>Approval Queue</h1>
                    <p>Review and manage room booking requests</p>
                </div>
            </div>

            <div className="stats-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
                <div className="stat-card card-peach" onClick={() => setActiveTab('all')} style={{cursor: 'pointer', border: activeTab === 'all' ? '2px solid #8b5cf6' : 'none'}}>
                    <span className="stat-icon" style={{color: '#8b5cf6'}}>📋</span>
                    <span className="stat-label">Total Requests</span>
                    <span className="stat-value">{getStatusCount('all')}</span>
                </div>
                <div className="stat-card card-yellow" onClick={() => setActiveTab('pending')} style={{cursor: 'pointer', border: activeTab === 'pending' ? '2px solid #f59e0b' : 'none'}}>
                    <span className="stat-icon" style={{color: '#f59e0b'}}>⏳</span>
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{getStatusCount('pending')}</span>
                </div>
                <div className="stat-card card-green" onClick={() => setActiveTab('approved')} style={{cursor: 'pointer', border: activeTab === 'approved' ? '2px solid #10b981' : 'none'}}>
                    <span className="stat-icon" style={{color: '#10b981'}}>✅</span>
                    <span className="stat-label">Approved</span>
                    <span className="stat-value">{getStatusCount('approved')}</span>
                </div>
                <div className="stat-card card-pink" onClick={() => setActiveTab('rejected')} style={{cursor: 'pointer', border: activeTab === 'rejected' ? '2px solid #ec4899' : 'none'}}>
                    <span className="stat-icon" style={{color: '#ec4899'}}>❌</span>
                    <span className="stat-label">Rejected</span>
                    <span className="stat-value">{getStatusCount('rejected')}</span>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-container">
                <div className="table-header-actions">
                    <h3 style={{fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0}}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests
                    </h3>
                    <span className="results-count">{filteredRequests.length} results</span>
                </div>

                <table className="data-table">
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
                            
                            const statusColor = request.status?.toLowerCase() === 'approved' ? 'green' 
                                              : request.status?.toLowerCase() === 'rejected' ? 'pink' 
                                              : 'yellow';

                            const initials = request.Teacher?.name ? request.Teacher.name.replace('Dr. ', '').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'RQ';

                            return (
                                <tr key={request.booking_id}>
                                    <td>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: `var(--card-${color})`, color: `var(--text-${color}-dark, #333)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>
                                                {initials}
                                            </div>
                                            <strong>{request.Teacher?.name || `Request #${request.booking_id}`}</strong>
                                        </div>
                                    </td>
                                    <td><strong>{request.Room?.room_number || 'N/A'}</strong></td>
                                    <td>{request.purpose || 'Not specified'}</td>
                                    <td>
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <span>{request.booking_date ? new Date(request.booking_date).toLocaleDateString() : 'N/A'}</span>
                                            <span style={{fontSize: '11px', color: '#64748b'}}>
                                                {request.TimeSlot?.start_time && request.TimeSlot?.end_time
                                                    ? `${request.TimeSlot.start_time} - ${request.TimeSlot.end_time}`
                                                    : 'Not specified'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${statusColor}`}>
                                            <span className="status-dot"></span> {request.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        {request.status?.toLowerCase() === 'pending' ? (
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <button
                                                    style={{background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowApproveModal(true);
                                                    }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    style={{background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'}}
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowRejectModal(true);
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{color: '#94a3b8', fontSize: '12px'}}>Processed</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredRequests.length === 0 && (
                    <div className="empty-state" style={{padding: '48px', textAlign: 'center', color: '#64748b'}}>
                        No {activeTab} requests found
                    </div>
                )}
            </div>

            {/* Approve Modal */}
            <ConfirmModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={handleApprove}
                title="Approve Booking"
                message={`Are you sure you want to approve this booking request for ${selectedRequest?.Room?.room_number}?`}
                confirmText="Approve"
                confirmVariant="primary"
            />

            {/* Reject Modal */}
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