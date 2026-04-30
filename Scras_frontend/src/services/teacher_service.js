/**
 * Teacher Service
 * Handles room searching, booking, and management for faculty
 */

import api from './api_config';

export const searchAvailableRooms = async (roomType, bookingDate, slotId) => {
    try {
        const typeParam = roomType && roomType !== 'All' ? `&room_type=${roomType}` : '';
        const response = await api.get(`/teacher/available-rooms?booking_date=${bookingDate}&slot_id=${slotId}${typeParam}`);
        return {
            success: true,
            data: response.data || []
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to search available rooms'
        };
    }
};

export const bookRoom = async (roomId, slotId, bookingDate, purpose) => {
    try {
        const response = await api.post('/teacher/book-room', {
            room_id: roomId,
            slot_id: slotId,
            booking_date: bookingDate,
            purpose
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to book room'
        };
    }
};

export const getMyBookings = async () => {
    try {
        const response = await api.get('/teacher/my-bookings');
        return {
            success: true,
            data: response.data || []
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch bookings'
        };
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.put('/teacher/cancel-booking', {
            booking_id: bookingId
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to cancel booking'
        };
    }
};

export const getTimeSlots = async () => {
    try {
        const response = await api.get('/teacher/time-slots');
        return {
            success: true,
            data: response.data || []
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch time slots'
        };
    }
};

export default {
    searchAvailableRooms,
    bookRoom,
    getMyBookings,
    cancelBooking,
    getTimeSlots
};
