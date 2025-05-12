import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const PORT = process.env.PORT || 5001;

// Create a minimal app for testing
const testApp = express();

// Add basic routes for testing
testApp.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

testApp.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Choose which app to use
const appToUse = process.env.USE_TEST_APP === 'true' ? testApp : app;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    appToUse.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection failed:", err));
