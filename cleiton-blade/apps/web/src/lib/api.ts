import { ApiResponse, Appointment, AuthResponse, Client, Payment, Professional, Schedule, Service } from '@/types';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log('🔧 API URL configurada:', API_URL);
console.log('🔧 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('🔧 Environment:', process.env.NODE_ENV);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiplas tentativas de renovação simultâneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor para adicionar token
apiClient.interceptors.request.use(
  (config) => {
    console.log('📤 Request URL:', config.baseURL + config.url);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para erro de autenticação com retry automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está renovando, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (!refreshToken) {
          throw new Error('Refresh token não encontrado');
        }

        console.log('🔄 Tentando renovar token...');

        // Criar requisição de refresh sem interceptors
        const refreshResponse = await axios.post<ApiResponse<AuthResponse>>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (refreshResponse.data.success && refreshResponse.data.data) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

          // Atualizar tokens no localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Atualizar header da requisição original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Processar fila de requisições que falharam
          processQueue(null, accessToken);

          // Retry a requisição original
          return apiClient(originalRequest);
        } else {
          throw new Error('Falha ao renovar token');
        }
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token:', refreshError);

        // Falha na renovação - fazer logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          processQueue(refreshError, null);
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export class ApiService {
  /**
   * GET request
   */
  static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * POST request
   */
  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  static async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle errors
   */
  private static handleError(error: any): ApiResponse<any> {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: {
        message: error.message || 'Erro desconhecido',
        code: 'ERROR',
      },
    };
  }
}

export const authService = {
  login: (email: string, password: string): Promise<ApiResponse<AuthResponse>> =>
    ApiService.post<AuthResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role?: string, adminKey?: string): Promise<ApiResponse<AuthResponse>> =>
    ApiService.post<AuthResponse>('/auth/register', { name, email, password, role, adminKey }),

  refresh: (refreshToken: string): Promise<ApiResponse<AuthResponse>> =>
    ApiService.post<AuthResponse>('/auth/refresh', { refreshToken }),

  me: (): Promise<ApiResponse<{ id: string; name: string; email: string; role: string; client?: any; professional?: any }>> =>
    ApiService.get('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> =>
    ApiService.put<{ success: boolean }>('/auth/change-password', { currentPassword, newPassword }),
};

export const clientService = {
  list: (page = 1, limit = 20): Promise<ApiResponse<any>> =>
    ApiService.get<any>(`/clients?page=${page}&limit=${limit}`),

  getById: (id: string): Promise<ApiResponse<Client>> =>
    ApiService.get<Client>(`/clients/${id}`),

  getByPhone: (phone: string): Promise<ApiResponse<Client>> =>
    ApiService.get<Client>(`/clients/phone/${phone}`),

  create: (name: string, phone: string, email?: string, birthDate?: string): Promise<ApiResponse<Client>> =>
    ApiService.post<Client>('/clients', { name, phone, email, birthDate }),

  update: (id: string, data: any): Promise<ApiResponse<Client>> =>
    ApiService.put<Client>(`/clients/${id}`, data),

  delete: (id: string): Promise<ApiResponse<any>> =>
    ApiService.delete<any>(`/clients/${id}`),

  block: (id: string): Promise<ApiResponse<Client>> =>
    ApiService.put<Client>(`/clients/${id}/block`, {}),

  addLoyaltyPoints: (id: string, points: number): Promise<ApiResponse<Client>> =>
    ApiService.post<Client>(`/clients/${id}/loyalty-points`, { points }),
};

export const professionalService = {
  list: (page = 1, limit = 20): Promise<ApiResponse<Professional[]>> =>
    ApiService.get<Professional[]>(`/professionals?page=${page}&limit=${limit}`),

  getById: (id: string): Promise<ApiResponse<Professional>> =>
    ApiService.get<Professional>(`/professionals/${id}`),

  getSchedules: (id: string): Promise<ApiResponse<Schedule[]>> =>
    ApiService.get<Schedule[]>(`/professionals/${id}/schedules`),

  getAppointments: (id: string): Promise<ApiResponse<Appointment[]>> =>
    ApiService.get<Appointment[]>(`/professionals/${id}/appointments`),

  create: (data: any): Promise<ApiResponse<Professional>> =>
    ApiService.post<Professional>('/professionals', data),

  update: (id: string, data: any): Promise<ApiResponse<Professional>> =>
    ApiService.put<Professional>(`/professionals/${id}`, data),
};

export const serviceService = {
  list: (): Promise<ApiResponse<Service[]>> =>
    ApiService.get<Service[]>('/services'),

  getById: (id: string): Promise<ApiResponse<Service>> =>
    ApiService.get<Service>(`/services/${id}`),

  create: (data: any): Promise<ApiResponse<Service>> =>
    ApiService.post<Service>('/services', data),

  update: (id: string, data: any): Promise<ApiResponse<Service>> =>
    ApiService.put<Service>(`/services/${id}`, data),

  toggle: (id: string): Promise<ApiResponse<Service>> =>
    ApiService.put<Service>(`/services/${id}/toggle`, {}),

  remove: (id: string): Promise<ApiResponse<{ success: boolean }>> =>
    ApiService.delete<{ success: boolean }>(`/services/${id}`),
};

export const scheduleService = {
  getByProfessional: (professionalId: string): Promise<ApiResponse<Schedule[]>> =>
    ApiService.get<Schedule[]>(`/schedules/professional/${professionalId}`),

  create: (data: any): Promise<ApiResponse<Schedule>> =>
    ApiService.post<Schedule>('/schedules', data),

  update: (id: string, data: any): Promise<ApiResponse<Schedule>> =>
    ApiService.put<Schedule>(`/schedules/${id}`, data),

  delete: (id: string): Promise<ApiResponse<{ success: boolean }>> =>
    ApiService.delete<{ success: boolean }>(`/schedules/${id}`),
};

export const appointmentService = {
  list: (filters?: any): Promise<ApiResponse<Appointment[]>> => {
    const params = new URLSearchParams(filters);
    return ApiService.get<Appointment[]>(`/appointments?${params.toString()}`);
  },

  getById: (id: string): Promise<ApiResponse<Appointment>> =>
    ApiService.get<Appointment>(`/appointments/${id}`),

  getByClient: (clientId: string): Promise<ApiResponse<Appointment[]>> =>
    ApiService.get<Appointment[]>(`/appointments/client/${clientId}`),

  getByProfessional: (professionalId: string): Promise<ApiResponse<Appointment[]>> =>
    ApiService.get<Appointment[]>(`/appointments/professional/${professionalId}`),

  getAvailableSlots: (professionalId: string, date: string, serviceId: string) =>
    ApiService.get(`/appointments/available?professional_id=${professionalId}&date=${date}&service_id=${serviceId}`),

  create: (data: any): Promise<ApiResponse<Appointment>> =>
    ApiService.post<Appointment>('/appointments', data),

  confirm: (id: string): Promise<ApiResponse<Appointment>> =>
    ApiService.put<Appointment>(`/appointments/${id}/confirm`, {}),

  complete: (id: string): Promise<ApiResponse<Appointment>> =>
    ApiService.put<Appointment>(`/appointments/${id}/complete`, {}),

  cancel: (id: string): Promise<ApiResponse<Appointment>> =>
    ApiService.put<Appointment>(`/appointments/${id}/cancel`, {}),

  markNoShow: (id: string): Promise<ApiResponse<Appointment>> =>
    ApiService.put<Appointment>(`/appointments/${id}/no-show`, {}),
};

export const paymentService = {
  list: (filters?: any): Promise<ApiResponse<Payment[]>> => {
    const params = new URLSearchParams(filters);
    return ApiService.get<Payment[]>(`/payments?${params.toString()}`);
  },

  getById: (id: string): Promise<ApiResponse<Payment>> =>
    ApiService.get<Payment>(`/payments/${id}`),

  getByAppointment: (appointmentId: string): Promise<ApiResponse<Payment[]>> =>
    ApiService.get<Payment[]>(`/payments/appointment/${appointmentId}`),

  create: (data: any): Promise<ApiResponse<Payment>> =>
    ApiService.post<Payment>('/payments', data),

  confirm: (id: string): Promise<ApiResponse<Payment>> =>
    ApiService.put<Payment>(`/payments/${id}/confirm`, {}),

  fail: (id: string): Promise<ApiResponse<Payment>> =>
    ApiService.put<Payment>(`/payments/${id}/fail`, {}),

  refund: (id: string): Promise<ApiResponse<Payment>> =>
    ApiService.put<Payment>(`/payments/${id}/refund`, {}),

  stats: (): Promise<ApiResponse<{ total: number; count: number; pending: number; completed: number }>> =>
    ApiService.get<{ total: number; count: number; pending: number; completed: number }>('/payments/stats'),
};

export default apiClient;
