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

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const port = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Other middleware
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/barbers", barberRouter);
app.use("/api/services", serviceRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/clients", clientRouter);
app.use("/api/appointments", appointmentRoutes);

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

// Use httpServer instead of app.listen
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
