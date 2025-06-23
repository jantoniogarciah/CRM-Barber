export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  services?: Service[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  service?: Service;
  barber?: Barber;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface Barber {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  instagram?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  clientId: string;
  serviceId: string;
  barberId: string;
  amount: number;
  status: 'completed' | 'cancelled' | 'refunded';
  paymentMethod: 'EFECTIVO' | 'DEBITO' | 'CREDITO';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  service?: Service;
  barber?: Barber;
}

export interface ServiceLog {
  id: string;
  clientId: string;
  serviceId: string;
  barberId: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  service?: Service;
  barber?: Barber;
}
