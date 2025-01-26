import * as tf from '@tensorflow/tfjs';
import { SpotifyService } from './spotify';

export class MLService {
  private model: tf.LayersModel | null = null;
  private spotify: SpotifyService;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  async initialize() {
    if (!this.model) {
      this.model = await tf.loadLayersModel('/models/music-recommendation');
    }
  }

  async suggestNextSong(
    currentMood: number,
    crowdEnergy: number,
    currentPlaylist: string[]
  ) {
    if (!this.model) {
      await this.initialize();
    }

    const input = tf.tensor2d([[currentMood, crowdEnergy]]);
    const prediction = this.model!.predict(input) as tf.Tensor;
    const targetFeatures = (await prediction.array()) as number[][];

    // Clean up tensors
    input.dispose();
    prediction.dispose();

    const recommendations = await this.spotify.getRecommendations({
      target_energy: targetFeatures[0][0],
      target_valence: targetFeatures[0][1],
      seed_tracks: currentPlaylist.slice(-5),
    });

    return recommendations;
  }

  async updateModel(
    crowdFeedback: number,
    songFeatures: number[],
    previousPrediction: number[]
  ) {
    if (!this.model) {
      await this.initialize();
    }

    const inputTensor = tf.tensor2d([songFeatures]);
    const targetTensor = tf.tensor2d([[crowdFeedback]]);
    const predictionTensor = tf.tensor2d([previousPrediction]);

    const loss = tf.losses.meanSquaredError(predictionTensor, targetTensor);
    
    await this.model!.trainOnBatch(inputTensor, targetTensor);

    // Clean up tensors
    const lossValue = await loss.array();
    inputTensor.dispose();
    targetTensor.dispose();
    predictionTensor.dispose();
    loss.dispose();

    return lossValue;
  }
} 