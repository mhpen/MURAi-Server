import mongoose from 'mongoose';

// Define a schema for model test metrics
const ModelTestMetricSchema = new mongoose.Schema({
  model_type: {
    type: String,
    required: true,
    enum: ['bert', 'roberta']
  },
  text_length: {
    type: Number,
    required: true
  },
  processing_time_ms: {
    type: Number,
    required: true
  },
  is_inappropriate: {
    type: Boolean,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create the model if it doesn't exist
const ModelTestMetric = mongoose.models.ModelTestMetric || mongoose.model('ModelTestMetric', ModelTestMetricSchema);

// Save test metrics
export const saveTestMetrics = async (req, res) => {
  try {
    const { model_type, text_length, processing_time_ms, is_inappropriate, confidence } = req.body;

    // Validate required fields
    if (!model_type || text_length === undefined || processing_time_ms === undefined || 
        is_inappropriate === undefined || confidence === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create and save the metrics
    const testMetric = new ModelTestMetric({
      model_type,
      text_length,
      processing_time_ms,
      is_inappropriate,
      confidence
    });

    await testMetric.save();

    return res.status(201).json({
      message: 'Test metrics saved successfully',
      data: testMetric
    });
  } catch (error) {
    console.error('Error saving test metrics:', error);
    return res.status(500).json({
      error: 'Failed to save test metrics',
      details: error.message
    });
  }
};

// Get all test metrics
export const getTestMetrics = async (req, res) => {
  try {
    const metrics = await ModelTestMetric.find().sort({ timestamp: -1 });
    
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching test metrics:', error);
    return res.status(500).json({
      error: 'Failed to fetch test metrics',
      details: error.message
    });
  }
};

// Get test metrics by model type
export const getTestMetricsByModel = async (req, res) => {
  try {
    const { model_type } = req.params;
    
    if (!model_type || !['bert', 'roberta'].includes(model_type)) {
      return res.status(400).json({ error: 'Invalid model type' });
    }
    
    const metrics = await ModelTestMetric.find({ model_type }).sort({ timestamp: -1 });
    
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching test metrics by model:', error);
    return res.status(500).json({
      error: 'Failed to fetch test metrics by model',
      details: error.message
    });
  }
};

// Get average processing time by model
export const getAverageProcessingTime = async (req, res) => {
  try {
    const result = await ModelTestMetric.aggregate([
      {
        $group: {
          _id: '$model_type',
          averageProcessingTime: { $avg: '$processing_time_ms' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error calculating average processing time:', error);
    return res.status(500).json({
      error: 'Failed to calculate average processing time',
      details: error.message
    });
  }
};
