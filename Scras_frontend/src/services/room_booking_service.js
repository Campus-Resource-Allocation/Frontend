/**
 * Room Booking Service
 * Used by Teachers and TAs for room booking functionality
 * 
 * Backend endpoints from teacher_routes.js and ta_routes.js:
 * - GET /api/teacher/available-rooms (or /api/ta/available-rooms)
 * - POST /api/teacher/book-room (or /api/ta/book-room)
 * - GET /api/teacher/my-bookings (or /api/ta/my-bookings)
 */

import api from './api_config';
import { getUserRole, getUserId } from './auth_service';

// Helper to get role-specific base path
const getRoleBasePath = () => {
    const role = getUserRole();
    return role === 'teacher' ? '/teacher' : '/ta';
};

// ==================== SEARCH AVAILABLE ROOMS ====================

/**
 * Search for available rooms
 * GET /api/{role}/available-rooms
 * @param {object} filters - { room_type, booking_date, start_time, end_time }
 */
export const searchAvailableRooms = async (filters = {}) => {
    try {
        const basePath = getRoleBasePath();
        const response = await api.get(`${basePath}/available-rooms`, { params: filters });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Search available rooms error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to search available rooms',
            data: []
        };
    }
};

// ==================== BOOK A ROOM ====================

/**
 * Book a room (creates a booking request)
 * POST /api/{role}/book-room
 * @param {object} bookingData - { room_id, booking_date, start_time, end_time, purpose }
 */
export const bookRoom = async (bookingData) => {
    try {
        const basePath = getRoleBasePath();
        const response = await api.post(`${basePath}/book-room`, bookingData);
        return {
            success: true,
            data: response.data,
            bookingId: response.data.booking_id
        };
    } catch (error) {
        console.error('Book room error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to book room'
        };
    }
};

// ==================== GET MY BOOKINGS ====================

/**
 * Get all bookings made by current user
 * GET /api/{role}/my-bookings
 */
export const getMyBookings = async () => {
    try {
        const basePath = getRoleBasePath();
        const response = await api.get(`${basePath}/my-bookings`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Get my bookings error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch bookings',
            data: []
        };
    }
};

// ==================== TEACHER SCHEDULE ====================

/**
 * Get teacher schedule by ID
 * GET /api/schedule/teacher/:id
 * @param {number} teacherId - Teacher ID (optional)
 */
export const getTeacherSchedule = async (teacherId = null) => {
    try {
        const id = teacherId || getUserId();
        const response = await api.get(`/schedule/teacher/${id}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Get teacher schedule error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch schedule',
            data: []
        };
    }
};

// Export all functions
export default {
    searchAvailableRooms,
    bookRoom,
    getMyBookings,
    getTeacherSchedule
};