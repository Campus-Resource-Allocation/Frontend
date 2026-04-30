/**
 * TA Service
 * Handles room searching, booking, and management for Teaching Assistants
 */

import api from './api_config';

export const searchAvailableRooms = async (roomType, bookingDate, slotId) => {
    try {
        const typeParam = roomType && roomType !== 'All' ? `&room_type=${roomType}` : '';
        const response = await api.get(`/ta/available-rooms?booking_date=${bookingDate}&slot_id=${slotId}${typeParam}`);
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
        const response = await api.post('/ta/book-room', {
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
        const response = await api.get('/ta/my-bookings');
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
        const response = await api.put('/ta/cancel-booking', {
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
        const response = await api.get('/ta/time-slots');
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
