import mongoose from 'mongoose';

const MLModelSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  weights: {
    energy: [Number],
    mood: [Number],
    rhythm: [Number],
  },
  lastUpdated: Date,
  performanceMetrics: {
    accuracy: Number,
    crowdSatisfaction: Number,
  },
});

export default mongoose.models.MLModel || mongoose.model('MLModel', MLModelSchema); 