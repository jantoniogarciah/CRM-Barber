import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { authRouter } from "./routes/auth.routes";
import { barberRouter } from "./routes/barber.routes";
import { serviceRouter } from "./routes/service.routes";
import { categoryRouter } from "./routes/category.routes";
import { clientRouter } from "./routes/client.routes";
import appointmentRoutes from "./routes/appointment.routes";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Simple CORS configuration that accepts all origins
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: corsOptions
});

const port = process.env.PORT || 3001;

// Other middleware
app.use(morgan('dev'));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'CRM Barber API',
    version: '1.0.0',
    docs: '/api'
  });
});

// Health check and API info route
app.get('/api', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      version: '1.0.0',
      database: 'connected',
      endpoints: {
        auth: '/api/auth',
        barbers: '/api/barbers',
        services: '/api/services',
        categories: '/api/categories',
        clients: '/api/clients',
        appointments: '/api/appointments'
      },
      documentation: 'Coming soon'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/barbers", barberRouter);
app.use("/api/services", serviceRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/clients", clientRouter);
app.use("/api/appointments", appointmentRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      type: err.name,
      code: err.code
    });

    // Send detailed error in development, generic in production
    const isProduction = process.env.NODE_ENV === 'production';
    const errorResponse = {
      message: isProduction ? "Something went wrong!" : err.message,
      type: isProduction ? undefined : err.name,
      ...(isProduction ? {} : { stack: err.stack })
    };

    res.status(err.status || 500).json(errorResponse);
  }
);

// Start server with specific host binding
const host = '0.0.0.0';
httpServer.listen({ port, host }, () => {
  console.log(`Server is running at http://${host}:${port}`);
  console.log(`API is accessible at http://${host}:${port}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
