import { Client } from './client';
import { Barber } from './barber';
import { Service } from './service';

export interface Appointment {
  id: string;
  client: Client;
  barber: Barber;
  service: Service;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
} 