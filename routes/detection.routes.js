import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const router = Router();
const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:8000';

// Text detection routes
router.post('/text', auth, async (req, res) => {
  try {
    const { text, model } = req.body;
    const startTime = Date.now();

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`Detecting profanity with model: ${model || 'roberta'}, text length: ${text.length} chars`);

    // Call the microservice with a timeout
    const response = await axios.post(`${MODEL_SERVICE_URL}/predict`, {
      text,
      model // Pass the model parameter if provided
    }, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const endTime = Date.now();
    console.log(`Model service responded in ${endTime - startTime}ms`);

    // Return the response from the microservice
    return res.json(response.data);
  } catch (error) {
    console.error('Error detecting profanity:', error.message);
    console.error('Error details:', error.response?.data || error.code || 'No additional details');

    // If the microservice is not available, provide a mock response
    // Handle a wider range of error conditions
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNABORTED' || error.code === 'ERR_BAD_RESPONSE' ||
        error.message.includes('timeout') || error.message.includes('Network Error') ||
        (error.response && (error.response.status >= 500 || error.response.status === 429))) {
      console.log(`Microservice at ${MODEL_SERVICE_URL} not available, returning mock response`);
      console.log(`Error details: ${error.message}`);

      // Create a mock response
      const mockResponse = {
        text: req.body.text,
        is_inappropriate: req.body.text.toLowerCase().includes('gago') ||
                          req.body.text.toLowerCase().includes('putang') ||
                          req.body.text.toLowerCase().includes('bobo'),
        confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
        processing_time_ms: Math.random() * 50 + 10, // Random processing time between 10 and 60ms
        model_used: req.body.model || 'roberta',
        note: "This is a mock response because the model service is unavailable"
      };

      return res.json(mockResponse);
    }

    return res.status(500).json({
      error: 'Error detecting profanity',
      details: error.message,
      model_service_url: MODEL_SERVICE_URL
    });
  }
});

router.get('/texts', auth, async (req, res) => {
  // TODO: Implement get all detected texts
});

router.get('/texts/:id', auth, async (req, res) => {
  // TODO: Implement get single detected text
});

// Word detection routes
router.get('/words', auth, async (req, res) => {
  // TODO: Implement get detected words
});

router.get('/words/:id', auth, async (req, res) => {
  // TODO: Implement get single detected word
});

// Validation routes
router.put('/texts/:id/validate', auth, async (req, res) => {
  // TODO: Implement validation update
});

// Test endpoint for the microservice (no auth required)
router.post('/test', async (req, res) => {
  try {
    const { text, model } = req.body;
    const startTime = Date.now();

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`Testing profanity detection with model: ${model || 'roberta'}, text: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    console.log(`Calling model service at: ${MODEL_SERVICE_URL}/predict`);

    // Call the microservice with a timeout
    const response = await axios.post(`${MODEL_SERVICE_URL}/predict`, {
      text,
      model // Pass the model parameter if provided
    }, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const endTime = Date.now();
    console.log(`Model service responded in ${endTime - startTime}ms`);
    console.log(`Response: ${JSON.stringify(response.data)}`);

    // Return the response from the microservice
    return res.json(response.data);
  } catch (error) {
    console.error('Error testing profanity detection:', error.message);
    console.error('Error details:', error.response?.data || error.code || 'No additional details');

    // If the microservice is not available, provide a mock response for testing
    // Handle a wider range of error conditions
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNABORTED' || error.code === 'ERR_BAD_RESPONSE' ||
        error.message.includes('timeout') || error.message.includes('Network Error') ||
        (error.response && (error.response.status >= 500 || error.response.status === 429))) {
      console.log(`Microservice at ${MODEL_SERVICE_URL} not available, returning mock response`);
      console.log(`Error details: ${error.message}`);

      // Create a mock response for testing purposes
      const mockResponse = {
        text: req.body.text,
        is_inappropriate: req.body.text.toLowerCase().includes('gago') ||
                          req.body.text.toLowerCase().includes('putang') ||
                          req.body.text.toLowerCase().includes('bobo'),
        confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
        processing_time_ms: Math.random() * 50 + 10, // Random processing time between 10 and 60ms
        model_used: req.body.model || 'roberta',
        note: "This is a mock response because the model service is unavailable"
      };

      return res.json(mockResponse);
    }

    return res.status(500).json({
      error: 'Error testing profanity detection',
      details: error.message,
      model_service_url: MODEL_SERVICE_URL
    });
  }
});

// Health check endpoint for the model service
router.get('/model-service-health', async (req, res) => {
  try {
    console.log(`Checking health of model service at: ${MODEL_SERVICE_URL}/health`);
    const startTime = Date.now();

    // Call the microservice health endpoint
    const response = await axios.get(`${MODEL_SERVICE_URL}/health`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json'
      }
    });

    const endTime = Date.now();
    console.log(`Model service health check responded in ${endTime - startTime}ms`);

    // Get test metrics counts
    const ModelTestMetric = mongoose.models.ModelTestMetric;
    const bertCount = ModelTestMetric ? await ModelTestMetric.countDocuments({ model_type: 'bert' }) : 0;
    const robertaCount = ModelTestMetric ? await ModelTestMetric.countDocuments({ model_type: 'roberta' }) : 0;

    return res.json({
      status: 'connected',
      model_service_url: MODEL_SERVICE_URL,
      response_time_ms: endTime - startTime,
      model_service_status: response.data,
      test_metrics: {
        bert_tests_count: bertCount,
        roberta_tests_count: robertaCount,
        total_tests_count: bertCount + robertaCount
      },
      server_time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking model service health:', error.message);
    console.error('Error details:', error.response?.data || error.code || 'No additional details');

    return res.status(500).json({
      status: 'disconnected',
      model_service_url: MODEL_SERVICE_URL,
      error: error.message,
      error_code: error.code || 'UNKNOWN',
      server_time: new Date().toISOString()
    });
  }
});

export default router;