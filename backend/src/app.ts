import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// CORS configuration
const corsOptions = {
  origin: function(origin: any, callback: any) {
    // Lista de dominios permitidos
    const allowedOrigins = [
      'https://www.clippercut.com.mx',
      'http://www.clippercut.com.mx',
      'https://clippercut.com.mx',
      'http://clippercut.com.mx'
    ];

    console.log('CORS Check:', {
      receivedOrigin: origin,
      allowedOrigins: allowedOrigins,
      isDevelopment: process.env.NODE_ENV === 'development'
    });

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided - allowing request');
      return callback(null, true);
    }

    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - allowing all origins');
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      console.log(`Origin ${origin} is allowed`);
      return callback(null, true);
    }

    // Origin not allowed
    console.log(`Origin ${origin} is not allowed`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'Accept',
    'X-Requested-With',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight request results for 24 hours
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Add CORS headers manually for additional security
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && corsOptions.origin && typeof corsOptions.origin === 'function') {
    corsOptions.origin(origin, (err: Error | null, allowed: boolean) => {
      if (allowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(','));
        res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
      }
    });
  }
  next();
});

// Middlewares
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

export default app; 