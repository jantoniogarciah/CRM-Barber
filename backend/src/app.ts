import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// CORS configuration
const corsOptions = {
  origin: function(origin: any, callback: any) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://crm-barber.onrender.com',
      'https://crm-barber-frontend.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://clippercut.com.mx',
      'http://clippercut.com.mx',
      'https://www.clippercut.com.mx',
      'http://www.clippercut.com.mx',
      'https://crm-barber-backend.onrender.com'
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app; 