import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Parking API
export const parkingAPI = {
  getSlots: () => api.get('/parking/slots'),
  getAvailableSlots: (params?: { location?: string; type?: string }) =>
    api.get('/parking/slots/available', { params }),
  createReservation: (data: { slotId: string; startTime: string; endTime: string }) =>
    api.post('/parking/reserve', data),
  getReservations: () => api.get('/parking/reservations'),
  cancelReservation: (id: string) => api.put(`/parking/reservations/${id}/cancel`),
  checkIn: (data: { qrCode: string }) => api.post('/parking/checkin', data),
  checkOut: (data: { slotId: string }) => api.post('/parking/checkout', data),
  getAnalytics: () => api.get('/parking/analytics'),
};

// Rides API
export const ridesAPI = {
  getRideTypes: () => api.get('/rides/types'),
  bookRide: (data: { type: string; pickupLocation: string; dropLocation: string; scheduledTime?: string }) =>
    api.post('/rides/book', data),
  getMyRides: () => api.get('/rides/my-rides'),
  cancelRide: (id: string) => api.put(`/rides/${id}/cancel`),
  updateRideStatus: (id: string, status: string) => api.put(`/rides/${id}/status`, { status }),
  getPoolOptions: (data: { pickupLocation: string; dropLocation: string }) =>
    api.post('/rides/pool', data),
  getAnalytics: () => api.get('/rides/analytics'),
};

// Payments API
export const paymentsAPI = {
  getHistory: () => api.get('/payments/history'),
  getStatus: (id: string) => api.get(`/payments/${id}/status`),
  requestRefund: (id: string) => api.post(`/payments/${id}/refund`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// Users API
export const usersAPI = {
  updateProfile: (data: { name?: string; phone?: string }) => api.put('/users/profile', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.put('/users/change-password', data),
  getAnalytics: () => api.get('/users/analytics'),
};

// Monitoring API
export const monitoringAPI = {
  getHealth: () => api.get('/monitoring/health'),
};

export default api; 