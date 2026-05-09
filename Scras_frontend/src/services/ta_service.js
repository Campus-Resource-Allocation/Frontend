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
        
        console.log("🔍 TA Service - Search Rooms Response:", response.data);
        
        // Handle both response formats
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            return response.data; // Backend already returns {success: true, data: [...]}
        }
        
        // Backend returns array directly
        return {
            success: true,
            data: Array.isArray(response.data) ? response.data : []
        };
        
    } catch (error) {
        console.error('❌ TA Service - Search rooms error:', error);
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
        
        console.log("✅ TA Service - Book Room Response:", response.data);
        
        // Handle both response formats
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            return response.data;
        }
        
        return {
            success: true,
            data: response.data
        };
        
    } catch (error) {
        console.error('❌ TA Service - Book room error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to book room'
        };
    }
};

export const getMyBookings = async () => {
    try {
        console.log("🚀 TA Service - Fetching bookings from /ta/my-bookings");
        
        const response = await api.get('/ta/my-bookings');
        
        console.log("📡 TA Service - Raw Response:", response);
        console.log("📦 TA Service - Response Data:", response.data);
        console.log("📊 TA Service - Data Type:", typeof response.data, "Is Array:", Array.isArray(response.data));
        
        // ✅ FIX: Handle the array response from backend
        let bookingsArray = [];
        
        if (Array.isArray(response.data)) {
            // Backend returns array directly: [{...}, {...}]
            bookingsArray = response.data;
            console.log("✨ TA Service - Backend returned array directly");
        } else if (response.data && typeof response.data === 'object') {
            if ('success' in response.data && 'data' in response.data) {
                // Backend returns {success: true, data: [...]}
                bookingsArray = response.data.data || [];
                console.log("✨ TA Service - Backend returned object with data property");
            } else if ('data' in response.data) {
                // Backend returns {data: [...]}
                bookingsArray = response.data.data || [];
            }
        }
        
        console.log("✅ TA Service - Final Bookings Array:", bookingsArray);
        console.log("📈 TA Service - Total Count:", bookingsArray.length);
        
        return {
            success: true,
            data: bookingsArray
        };
        
    } catch (error) {
        console.error('❌ TA Service - Get bookings error:', error);
        console.error('❌ TA Service - Error Response:', error.response);
        return {
            success: false,
            data: [],
            message: error.response?.data?.error || 'Failed to fetch bookings'
        };
    }
};

export const getTimeSlots = async () => {
    try {
        const response = await api.get('/ta/time-slots');
        
        console.log("🕐 TA Service - Time Slots Response:", response.data);
        
        return {
            success: true,
            data: response.data || []
        };
    } catch (error) {
        console.error('❌ TA Service - Get time slots error:', error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.error || 'Failed to fetch time slots'
        };
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.delete(`/ta/cancel-booking/${bookingId}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('❌ TA Service - Cancel booking error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to cancel booking'
        };
    }
};

export default {
    searchAvailableRooms,
    bookRoom,
    getMyBookings,
    getTimeSlots,
    cancelBooking
};