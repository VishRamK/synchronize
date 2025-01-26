import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  spotifyId: String,
  spotifyAccessToken: String,
  spotifyRefreshToken: String,
  preferences: {
    energyThreshold: Number,
    moodSensitivity: Number,
    rhythmAdaptation: Boolean,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 