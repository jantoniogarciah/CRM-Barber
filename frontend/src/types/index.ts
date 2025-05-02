export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'client' | 'barber';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  clientId: number;
  serviceId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  service?: Service;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
} 