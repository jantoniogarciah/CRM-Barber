export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  notes: string | null;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastVisit: string | null;
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
  description: string;
  price: number;
  duration: number;
  image?: string;
  isActive: boolean;
  categoryId?: string;
  category?: Category;
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
  notes: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  barber?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
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
  phone: string;
  email?: string;
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
  saleDate?: string;
  createdAt: string;
  updatedAt: string;
  client: Client;
  service: Service;
  barber: Barber;
}
