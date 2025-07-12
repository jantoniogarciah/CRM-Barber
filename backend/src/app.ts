import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://crm-barber.onrender.com',
    'https://crm-barber-frontend.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://clippercut.com.mx',
    'http://clippercut.com.mx'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Middlewares
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app; 