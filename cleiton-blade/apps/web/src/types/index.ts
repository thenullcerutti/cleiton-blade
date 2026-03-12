// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professional';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birth_date?: string;
  loyaltyPoints: number;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  userId: string;
  name: string;
  commissionPercentage: number;
  active: boolean;
  schedules?: Schedule[];
  appointments?: Appointment[];
  createdAt: string;
  updatedAt: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Schedule Types
export interface Schedule {
  id: string;
  professionalId: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakStart?: string;
  breakEnd?: string;
  createdAt: string;
  updatedAt: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  appointmentDatetime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show';
  origin: 'whatsapp' | 'app' | 'web' | 'admin';
  paymentStatus: 'pending' | 'paid';
  notes?: string;
  client?: Client;
  professional?: Professional;
  service?: Service;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSlot {
  time: string; // ISO format
  timeDisplay: string; // HH:mm format
}

export interface AvailableSlots {
  professionalId: string;
  serviceId: string;
  date: string;
  durationMinutes: number;
  availableSlots: AppointmentSlot[];
  totalSlots: number;
}

// Payment Types
export interface Payment {
  id: string;
  appointmentId: string;
  method: 'pix' | 'card' | 'cash' | 'pending';
  amount: number;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface AuthContext {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
