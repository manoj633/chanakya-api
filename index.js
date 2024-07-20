import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import winston from "winston";
import expressWinston from "express-winston";
import "winston-daily-rotate-file";

import authRoute from "./routes/authRoutes.js";

const app = express();
dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message.
    expressFormat: true, // Use the default Express/morgan request formatting.
    colorize: false, // Color the text and status code (default to false)
    ignoreRoute: function (req, res) {
      return false;
    }, // optional: allows to skip some log messages based on request and/or response
  })
);

app.use("/api/auth", authRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  const errorState = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  logger.error(`Error: ${errorMessage}, Stack: ${err.stack}`, {
    status: errorState,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });
  return res.status(errorState).json({
    success: false,
    status: errorState,
    message: errorMessage,
    stack: err.stack,
  });
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDb disconnected!");
});

mongoose.connection.on("connected", () => {
  logger.info("MongoDb connected!");
});

const server = app.listen(8080, () => {
  connect();
  logger.info("Connected to backend");
});

// Graceful shutdown
process.on("SIGINT", () => {
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info("MongoDb connection closed.");
      process.exit(0);
    });
  });
});
