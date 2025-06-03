import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { authRouter } from "./routes/auth.routes";
import { barberRouter } from "./routes/barber.routes";
import { serviceRouter } from "./routes/service.routes";
import { categoryRouter } from "./routes/category.routes";
import { clientRouter } from "./routes/client.routes";
import appointmentRoutes from "./routes/appointment.routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);

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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/barbers", barberRouter);
app.use("/api/services", serviceRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/clients", clientRouter);
app.use("/api/appointments", appointmentRoutes);

// Serve React's index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

// Start server with specific host binding
const host = '0.0.0.0';
httpServer.listen({ port, host }, () => {
  console.log(`Server is running at http://${host}:${port}`);
  console.log(`API is accessible at http://${host}:${port}/api`);
  console.log(`Frontend is served at http://${host}:${port}`);
});
