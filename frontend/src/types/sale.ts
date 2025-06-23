import { Client } from './client';
import { Barber } from './barber';
import { Service } from './service';

export interface Sale {
  id: string;
  client?: Client;
  barber?: Barber;
  service?: Service;
  amount: number;
  paymentMethod: 'EFECTIVO' | 'DEBITO' | 'CREDITO';
  createdAt: string;
  updatedAt: string;
} 