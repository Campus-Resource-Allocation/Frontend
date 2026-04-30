/**
 * Student Service - Matches Backend Student Routes
 * Endpoints:
 * - GET /student/timetable
 * - GET /student/find-class
 * - GET /schedule/student/:id
 */

import api from './api_config';
import { getCurrentUser } from './auth_service';

export const getMyTimetable = async () => {
    try {
        const response = await api.get('/student/timetable');
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get timetable error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch timetable',
            data: [],
        };
    }
};

export const findMyCurrentClass = async () => {
    try {
        const response = await api.get('/student/find-class');
        return {
            success: true,
            data: response.data,
            hasClass: response.data && response.data.course_code,
        };
    } catch (error) {
        console.error('Find current class error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to find current class',
            hasClass: false,
            data: null,
        };
    }
};

export const getStudentSchedule = async (studentId = null) => {
    try {
        const user = getCurrentUser();
        const id = studentId || user?.reference_id;

        if (!id) {
            return {
                success: false,
                message: 'Student ID not found',
                data: [],
            };
        }

        const response = await api.get(`/schedule/student/${id}`);
        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Get student schedule error:', error);
        return {
            success: false,
            message: error.response?.data?.error || 'Failed to fetch schedule',
            data: [],
        };
    }
};

export default {
    getMyTimetable,
    findMyCurrentClass,
    getStudentSchedule,
};