export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 