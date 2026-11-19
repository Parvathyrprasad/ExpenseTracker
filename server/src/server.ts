import app from './app';
import { config } from './config';
import { prisma } from './prisma';

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✓ Successfully connected to PostgreSQL database.');

    app.listen(config.port, () => {
      console.log(`✓ Expense Tracker Backend is running at http://localhost:${config.port}`);
      console.log(`✓ Default currency configured: ${config.defaultCurrency} (${config.defaultCurrencySymbol})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
