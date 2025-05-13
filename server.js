import app from './app.js';
import connectWithRetry from './utils/db.js';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectWithRetry();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API URL: ${process.env.API_URL || 'http://localhost:' + PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});
