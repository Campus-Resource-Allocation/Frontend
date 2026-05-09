/**
 * Teacher Service
 * Handles room searching, booking, and management for faculty
 */

import api from './api_config';

export const searchAvailableRooms = async (roomType, bookingDate, startTime, endTime) => {
    try {
        const response = await api.get('/teacher/available-rooms', {
            params: {
                room_type: roomType,
                booking_date: bookingDate,
                start_time: startTime,
                end_time: endTime
            }
        });
        
        console.log("🔍 Teacher Service - Search Rooms Response:", response.data);
        
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
        console.error('❌ Teacher Service - Search rooms error:', error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.error || 'Failed to search available rooms'
        };
    }
};

export const bookRoom = async (roomId, bookingDate, startTime, endTime, purpose) => {
    try {
        const response = await api.post('/teacher/book-room', {
            room_id: roomId,
            booking_date: bookingDate,
            start_time: startTime,
            end_time: endTime,
            purpose
        });
        
        console.log("✅ Teacher Service - Book Room Response:", response.data);
        
        // Handle both response formats
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            return response.data;
        }
        
        return {
            success: true,
            data: response.data
        };
        
    } catch (error) {
        console.error('❌ Teacher Service - Book room error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to book room'
        };
    }
};

export const getMyBookings = async () => {
    try {
        console.log("🚀 Teacher Service - Fetching bookings from /teacher/my-bookings");
        
        const response = await api.get('/teacher/my-bookings');
        
        console.log("📡 Teacher Service - Raw Response:", response);
        console.log("📦 Teacher Service - Response Data:", response.data);
        console.log("📊 Teacher Service - Data Type:", typeof response.data, "Is Array:", Array.isArray(response.data));
        
        // ✅ FIX: Handle the array response from backend
        let bookingsArray = [];
        
        if (Array.isArray(response.data)) {
            // Backend returns array directly: [{...}, {...}]
            bookingsArray = response.data;
            console.log("✨ Teacher Service - Backend returned array directly");
        } else if (response.data && typeof response.data === 'object') {
            if ('success' in response.data && 'data' in response.data) {
                // Backend returns {success: true, data: [...]}
                bookingsArray = response.data.data || [];
                console.log("✨ Teacher Service - Backend returned object with data property");
            } else if ('data' in response.data) {
                // Backend returns {data: [...]}
                bookingsArray = response.data.data || [];
            }
        }
        
        console.log("✅ Teacher Service - Final Bookings Array:", bookingsArray);
        console.log("📈 Teacher Service - Total Count:", bookingsArray.length);
        
        return {
            success: true,
            data: bookingsArray
        };
        
    } catch (error) {
        console.error('❌ Teacher Service - Get bookings error:', error);
        console.error('❌ Teacher Service - Error Response:', error.response);
        return {
            success: false,
            data: [],
            message: error.response?.data?.error || 'Failed to fetch bookings'
        };
    }
};

export const getTimeSlots = async () => {
    try {
        const response = await api.get('/teacher/time-slots');
        
        console.log("🕐 Teacher Service - Time Slots Response:", response.data);
        
        return {
            success: true,
            data: response.data || []
        };
    } catch (error) {
        console.error('❌ Teacher Service - Get time slots error:', error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.error || 'Failed to fetch time slots'
        };
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.delete(`/teacher/cancel-booking/${bookingId}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('❌ Teacher Service - Cancel booking error:', error);
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