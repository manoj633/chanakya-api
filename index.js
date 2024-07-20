import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import winston from "winston";

import authRoute from "./routes/authRoutes.js";

const app = express();
dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};

// Middlewares
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

app.use((req, res, next) => {
  logger.info(`Request URL: ${req.url}`);
  next();
});

app.use("/api/auth", authRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  const errorState = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  logger.error(`Error: ${errorMessage}, Stack: ${err.stack}`);
  return res.status(errorState).json({
    success: false,
    status: errorState,
    message: errorMessage,
    stack: err.stack,
  });
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDb disconnected!");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDb connected!");
});

const server = app.listen(8080, () => {
  connect();
  console.log("Connected to backend");
});

// Graceful shutdown
process.on("SIGINT", () => {
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDb connection closed.");
      process.exit(0);
    });
  });
});
