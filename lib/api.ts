const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Type definitions
export interface Ride {
  id: string;
  pickupLocation: string;
  destination: string;
  proposedFare: number;
  acceptedFare?: number;
  finalFare?: number;
  type: 'now' | 'scheduled';
  status: string;
  passengers: number;
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: string;
  passenger?: any;
  driver?: any;
}

export interface RidesResponse {
  rides: Ride[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let error: any;
        try {
          error = await response.json();
        } catch (e) {
          error = {
            message: response.statusText || 'Request failed',
          statusCode: response.status,
          };
        }
        const apiError: any = new Error(error.message || error.error || 'Request failed');
        apiError.statusCode = error.statusCode || response.status;
        if (error.statusCode === 500) {
          apiError.message = 'Internal server error. Please check if the backend server is running and try again.';
        }
        throw apiError;
      }

      return await response.json();
    } catch (error: any) {
      // Don't log 404 errors for KYC endpoint (expected for new users)
      const isKYC404 = error?.statusCode === 404 && endpoint.includes('/kyc');
      if (!isKYC404) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'passenger' | 'driver';
  }) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // User endpoints
  async getUsers(params?: {
    role?: 'passenger' | 'driver';
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request(`/users${queryString}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Ride endpoints
  async createRide(data: {
    pickupLocation: string;
    destination: string;
    proposedFare: number;
    type: 'now' | 'scheduled';
    passengers: number;
    scheduledDate?: string;
    scheduledTime?: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    destinationLatitude?: number;
    destinationLongitude?: number;
  }) {
    return this.request('/rides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRides(params?: {
    role?: 'passenger' | 'driver';
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<RidesResponse> {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : '';
    return this.request<RidesResponse>(`/rides${queryString}`);
  }

  async getPendingRides() {
    return this.request('/rides/pending');
  }

  async getRide(id: string) {
    return this.request(`/rides/${id}`);
  }

  async acceptRide(rideId: string, counterOffer?: number) {
    return this.request(`/rides/${rideId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ counterOffer }),
    });
  }

  async cancelRide(rideId: string, reason: string) {
    return this.request(`/rides/${rideId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async endRide(rideId: string) {
    return this.request(`/rides/${rideId}/end`, {
      method: 'POST',
    });
  }


  async counterOfferRide(rideId: string, counterOffer: number) {
    return this.acceptRide(rideId, counterOffer);
  }

  async updateRide(id: string, data: any) {
    return this.request(`/rides/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async confirmDriver(rideId: string, driverId: string) {
    return this.request(`/rides/${rideId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ driverId }),
    });
  }

  async getRideAcceptances(rideId: string) {
    return this.request(`/rides/${rideId}/acceptances`);
  }

  // Payment endpoints
  async createPayment(data: {
    rideId: string;
    amount: number;
    method: string;
  }) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayments() {
    return this.request('/payments');
  }

  async getEarnings(startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const queryString = Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request(`/payments/earnings${queryString}`);
  }

  // KYC endpoints
  async submitKYC(data: any) {
    return this.request('/kyc', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getKYC() {
    try {
      const result = await this.request('/kyc');
      // If backend returns empty object, return null for consistency
      return result && Object.keys(result).length > 0 ? result : null;
    } catch (error: any) {
      // 404 is expected for new users - return null instead of throwing
      if (error?.statusCode === 404 || error?.message?.includes('404') || error?.message?.toLowerCase().includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async updateKYC(data: any) {
    return this.request('/kyc', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Vehicle endpoints
  async registerVehicle(data: any) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVehicle() {
    try {
      const result = await this.request('/vehicles');
      // If backend returns empty object, return null for consistency
      return result && Object.keys(result).length > 0 ? result : null;
    } catch (error: any) {
      // 404 is expected when vehicle doesn't exist - return null instead of throwing
      if (error?.statusCode === 404 || error?.message?.includes('404') || error?.message?.toLowerCase().includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async getAllVehicles() {
    try {
      return await this.request('/vehicles/all');
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  }

  async getVehicleById(id: string) {
    return this.request(`/vehicles/${id}`);
  }

  async updateVehicle(id: string, data: any) {
    return this.request(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteVehicle(id: string) {
    return this.request(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }


  async getConversation(userId: string, rideId?: string) {
    const queryString = rideId ? `?rideId=${rideId}` : '';
    return this.request(`/messages/conversation/${userId}${queryString}`);
  }

  // Rating endpoints
  async createRating(data: {
    userId: string;
    rideId: string;
    rating: number;
    comment?: string;
  }) {
    return this.request('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserRatings(userId: string) {
    return this.request(`/ratings/user/${userId}`);
  }

  // Admin endpoints - get all data (not user-specific)
  async getAllUsers(params?: {
    role?: 'passenger' | 'driver';
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams: any = {}
    if (params) {
      if (params.role) queryParams.role = params.role
      if (params.status) queryParams.status = params.status
      if (params.page) queryParams.page = params.page.toString()
      if (params.limit) queryParams.limit = params.limit.toString()
    }
    const queryString = Object.keys(queryParams).length > 0
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    return this.request(`/users${queryString}`);
  }

  async getAllRides(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams: any = {}
    if (params) {
      if (params.status) queryParams.status = params.status
      if (params.page) queryParams.page = params.page.toString()
      if (params.limit) queryParams.limit = params.limit.toString()
    }
    const queryString = Object.keys(queryParams).length > 0
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    return this.request(`/rides${queryString}`);
  }

  async getAllPayments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    // Note: Backend payments endpoint is user-specific, so this might need backend modification
    // For now, we'll try to get all payments (admin might need special endpoint)
    const queryParams: any = {}
    if (params) {
      if (params.status) queryParams.status = params.status
      if (params.page) queryParams.page = params.page.toString()
      if (params.limit) queryParams.limit = params.limit.toString()
    }
    const queryString = Object.keys(queryParams).length > 0
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
    try {
      return this.request(`/payments${queryString}`);
    } catch (err) {
      // If it fails, return empty array
      console.warn('Failed to fetch all payments, endpoint might be user-specific:', err);
      return [];
    }
  }

  async getUserStatistics() {
    return this.request('/users/statistics');
  }

  async getRideStatistics() {
    return this.request('/rides/statistics');
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUserStatus(id: string, status: string) {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteRide(id: string) {
    return this.request(`/rides/${id}`, {
      method: 'DELETE',
    });
  }

  async updatePaymentStatus(id: string, status: string) {
    return this.request(`/payments/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // KYC Admin endpoints
  async getAllKYC(status?: string) {
    const queryString = status ? `?status=${status}` : '';
    return this.request(`/kyc/all${queryString}`);
  }

  async updateKYCStatus(userId: string, status: string, rejectionReason?: string) {
    return this.request('/kyc/status', {
      method: 'PATCH',
      body: JSON.stringify({ userId, status, rejectionReason }),
    });
  }

  async getKYCByUserId(userId: string) {
    // Note: This might need a backend endpoint
    try {
      const allKYC = await this.getAllKYC();
      const kycList = Array.isArray(allKYC) ? allKYC : [];
      return kycList.find((kyc: any) => kyc.userId === userId || kyc.user?.id === userId) || null;
    } catch (err) {
      console.error('Failed to get KYC by user ID:', err);
      return null;
    }
  }

  // Settings endpoints
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data: {
    platformFeePercent?: number;
    minimumFare?: number;
    baseRatePerMile?: number;
    baseRatePerMinute?: number;
    platformName?: string;
    supportEmail?: string;
    supportPhone?: string;
    timezone?: string;
    defaultLanguage?: string;
  }) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePricingSettings(data: {
    platformFeePercent?: number;
    minimumFare?: number;
    baseRatePerMile?: number;
    baseRatePerMinute?: number;
  }) {
    return this.request('/settings/pricing', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async calculateFare(distanceInMiles: number, durationInMinutes: number) {
    const settings: any = await this.getSettings();
    const baseFare =
      distanceInMiles * parseFloat(String(settings?.baseRatePerMile || 1.5)) +
      durationInMinutes * parseFloat(String(settings?.baseRatePerMinute || 0.3));
    const finalFare = Math.max(baseFare, parseFloat(String(settings?.minimumFare || 5)));
    const platformFee = (finalFare * parseFloat(String(settings?.platformFeePercent || 20))) / 100;
    const driverEarning = finalFare - platformFee;

    return {
      baseFare: Number(baseFare.toFixed(2)),
      finalFare: Number(finalFare.toFixed(2)),
      platformFee: Number(platformFee.toFixed(2)),
      driverEarning: Number(driverEarning.toFixed(2)),
    };
  }

  // Notification endpoints
  async getNotifications(unreadOnly = false) {
    const queryString = unreadOnly ? '?unreadOnly=true' : '';
    return this.request(`/notifications${queryString}`);
  }

  async getUnreadNotificationCount() {
    const result = await this.request<{ count: number }>('/notifications/unread/count');
    return result.count;
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Message endpoints
  async getMessages(otherUserId: string, rideId?: string) {
    const queryString = rideId ? `?rideId=${rideId}` : '';
    return this.request<Message[]>(`/messages/conversation/${otherUserId}${queryString}`);
  }

  async sendMessage(receiverId: string, content: string, rideId?: string) {
    return this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, rideId }),
    });
  }

  async getUnreadMessageCount() {
    const result = await this.request<{ count: number }>('/messages/unread/count');
    return result.count;
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'POST',
    });
  }
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sender?: {
    id: string;
    name: string;
  };
  receiver?: {
    id: string;
    name: string;
  };
  rideId?: string;
  createdAt: string;
  isRead: boolean;
}

export const api = new ApiClient(API_BASE_URL);

