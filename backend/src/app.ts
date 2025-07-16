import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// CORS configuration
const corsOptions = {
  origin: function(origin: any, callback: any) {
    console.log('Incoming request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided, allowing request');
      return callback(null, true);
    }
    
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
      'https://crm-barber-backend.onrender.com',
      'https://clippercut.com.mx:443',
      'http://clippercut.com.mx:80',
      'https://www.clippercut.com.mx:443',
      'http://www.clippercut.com.mx:80'
    ];

    // Check if the origin matches any allowed origin pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      const originUrl = new URL(origin);
      const allowedUrl = new URL(allowedOrigin);
      
      // Compare hostname without www if present
      const originHostname = originUrl.hostname.replace(/^www\./, '');
      const allowedHostname = allowedUrl.hostname.replace(/^www\./, '');
      
      return originHostname === allowedHostname && 
             (originUrl.protocol === allowedUrl.protocol || allowedUrl.protocol === 'http:');
    });

    console.log('Origin check details:', {
      origin,
      isAllowed,
      allowedOrigins
    });

    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('Origin rejected:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight request results for 24 hours
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Middlewares
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app; 