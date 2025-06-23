export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 