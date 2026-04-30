/**
 * Admin Service - Matches Backend Admin Routes
 * Endpoints:
 * - GET /admin/departments
 * - POST /admin/department
 * - DELETE /admin/department/:id
 * - GET /admin/teachers
 * - POST /admin/teacher
 * - DELETE /admin/teacher/:id
 * - GET /admin/students
 * - POST /admin/student
 * - DELETE /admin/student/:id
 * - GET /admin/rooms
 * - POST /admin/room
 * - DELETE /admin/room/:id
 * - GET /admin/courses
 * - POST /admin/course
 * - DELETE /admin/course/:id
 * - GET /admin/room-bookings
 * - PUT /admin/room-booking/:id/approve
 * - PUT /admin/room-booking/:id/reject
 */

import api from './api_config';

// ==================== DEPARTMENT APIs ====================

export const getDepartments = async () => {
    try {
        const response = await api.get('/admin/departments');
        // Backend returns array directly
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get departments error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch departments',
            data: [],
        };
    }
};

export const createDepartment = async (departmentData) => {
    try {
        const response = await api.post('/admin/department', departmentData);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to create department',
        };
    }
};

export const deleteDepartment = async (id) => {
    try {
        const response = await api.delete(`/admin/department/${id}`);
        return {
            success: true,
            message: response.data?.message || 'Department deleted successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to delete department',
        };
    }
};

// ==================== TEACHER APIs ====================

export const getTeachers = async () => {
    try {
        const response = await api.get('/admin/teachers');
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get teachers error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch teachers',
            data: [],
        };
    }
};

export const createTeacher = async (teacherData) => {
    try {
        const response = await api.post('/admin/teacher', teacherData);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to create teacher',
        };
    }
};

export const deleteTeacher = async (id) => {
    try {
        const response = await api.delete(`/admin/teacher/${id}`);
        return {
            success: true,
            message: response.data?.message || 'Teacher deleted successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to delete teacher',
        };
    }
};

// ==================== TA APIs ====================

export const getTAs = async () => {
    try {
        const response = await api.get('/admin/tas');
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get TAs error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch TAs',
            data: [],
        };
    }
};

export const createTA = async (taData) => {
    try {
        const response = await api.post('/admin/ta', taData);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to create TA',
        };
    }
};

export const deleteTA = async (id) => {
    try {
        const response = await api.delete(`/admin/ta/${id}`);
        return {
            success: true,
            message: response.data?.message || 'TA deleted successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to delete TA',
        };
    }
};

// ==================== STUDENT APIs ====================

export const getStudents = async () => {
    try {
        const response = await api.get('/admin/students');
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get students error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch students',
            data: [],
        };
    }
};

export const createStudent = async (studentData) => {
    try {
        const response = await api.post('/admin/student', studentData);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to create student',
        };
    }
};

export const deleteStudent = async (id) => {
    try {
        const response = await api.delete(`/admin/student/${id}`);
        return {
            success: true,
            message: response.data?.message || 'Student deleted successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to delete student',
        };
    }
};

// ==================== ROOM APIs ====================

export const getRooms = async () => {
    try {
        const response = await api.get('/admin/rooms');
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get rooms error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch rooms',
            data: [],
        };
    }
};

export const createRoom = async (roomData) => {
    try {
        const response = await api.post('/admin/room', roomData);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to create room',
        };
    }
};

export const deleteRoom = async (id) => {
    try {
        const response = await api.delete(`/admin/room/${id}`);
        return {
            success: true,
            message: response.data?.message || 'Room deleted successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to delete room',
        };
    }
};

// ==================== COURSE APIs ====================

export const getCourses = async () => {
    try {
        const response = await api.get('/admin/courses');
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get courses error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch courses',
            data: [],
        };
    }
};

export const createCourse = async (courseData) => {
    try {
        const response = await api.post('/admin/course', courseData);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to create course',
        };
    }
};

export const deleteCourse = async (courseCode) => {
    try {
        const response = await api.delete(`/admin/course/${courseCode}`);
        return {
            success: true,
            message: response.data?.message || 'Course deleted successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to delete course',
        };
    }
};

// ==================== TIMETABLE APIs ====================

export const uploadTimetable = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/admin/timetable/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to upload timetable',
        };
    }
};

// ==================== BOOKING/APPROVAL APIs ====================

export const getBookingRequests = async () => {
    try {
        const response = await api.get('/admin/room-bookings');
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get booking requests error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch booking requests',
            data: [],
        };
    }
};

export const approveBooking = async (bookingId) => {
    try {
        const response = await api.put(`/admin/room-booking/${bookingId}/approve`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to approve booking',
        };
    }
};

export const rejectBooking = async (bookingId) => {
    try {
        const response = await api.put(`/admin/room-booking/${bookingId}/reject`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to reject booking',
        };
    }
};

// Export all functions
export default {
    getDepartments,
    createDepartment,
    deleteDepartment,
    getTeachers,
    createTeacher,
    deleteTeacher,
    getStudents,
    createStudent,
    deleteStudent,
    getRooms,
    createRoom,
    deleteRoom,
    getCourses,
    createCourse,
    deleteCourse,
    getTAs,
    createTA,
    deleteTA,
    getBookingRequests,
    approveBooking,
    rejectBooking,
    uploadTimetable
};