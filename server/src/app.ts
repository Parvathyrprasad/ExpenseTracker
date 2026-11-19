import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import transactionRoutes from './routes/transaction.routes';
import budgetRoutes from './routes/budget.routes';
import analyticsRoutes from './routes/analytics.routes';

const app: Application = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'expense-tracker-api',
    defaultCurrency: config.defaultCurrency,
    defaultCurrencySymbol: config.defaultCurrencySymbol,
  });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Category Routes
app.use('/api/categories', categoryRoutes);

// Transaction Routes
app.use('/api/transactions', transactionRoutes);

// Budget Routes
app.use('/api/budgets', budgetRoutes);

// Analytics & Reports Routes
app.use('/api/analytics', analyticsRoutes);

// Central Error Handling
app.use(errorHandler);

export default app;
