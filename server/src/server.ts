import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connection';
import routes from './api/routes';
import { AppError, logger } from './utils';
import { initializeGeminiClient } from './ai/geminiClient';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

logger.info(`Loaded Env Vars: RPC_URL=${process.env.RPC_URL ? 'Set' : 'Unset'}, PRIVATE_KEY=${process.env.PRIVATE_KEY ? 'Set' : 'Unset'}, CONTRACT=${process.env.CONTRACT_ADDRESS}`);


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (basic setup)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Multer errors
  if (err.name === 'MulterError' || err.message?.includes('Field')) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: `File upload error: ${err.message}. Please ensure you're sending a file with field name 'file'.`,
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

// Start server only if MongoDB connects successfully
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize Gemini AI client
    initializeGeminiClient();
    logger.info('Gemini AI client initialized');
    
    // Start Express server only after successful DB connection
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
