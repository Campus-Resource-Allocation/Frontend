/**
 * TA Service
 * Handles room searching, booking, and management for Teaching Assistants
 */

import api from './api_config';

export const searchAvailableRooms = async (roomType, bookingDate, startTime, endTime) => {
    try {
        const response = await api.get('/ta/available-rooms', {
            params: {
                room_type: roomType,
                booking_date: bookingDate,
                start_time: startTime,
                end_time: endTime
            }
        });
        
        // Backend returns {success: true, data: [...]}
        return response.data;
        
    } catch (error) {
        console.error('Search rooms error:', error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.error || 'Failed to search available rooms'
        };
    }
};

export const bookRoom = async (roomId, bookingDate, startTime, endTime, purpose) => {
    try {
        const response = await api.post('/ta/book-room', {
            room_id: roomId,
            booking_date: bookingDate,
            start_time: startTime,
            end_time: endTime,
            purpose
        });
        
        // Backend returns {success: true, message: "..."}
        return response.data;
        
    } catch (error) {
        console.error('Book room error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to book room'
        };
    }
};

export const getMyBookings = async () => {
    try {
        const response = await api.get('/ta/my-bookings');
        
        // Backend returns {success: true, data: [...]}
        return response.data;
        
    } catch (error) {
        console.error('Get bookings error:', error);
        return {
            success: false,
            data: [],
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