import SpotifyWebApi from 'spotify-web-api-node';

export class SpotifyService {
  private spotifyApi: SpotifyWebApi;

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });
  }

  async setAccessToken(token: string) {
    this.spotifyApi.setAccessToken(token);
  }

  async getRecommendations({
    target_energy,
    target_valence,
    seed_tracks,
  }: {
    target_energy: number;
    target_valence: number;
    seed_tracks: string[];
  }) {
    const response = await this.spotifyApi.getRecommendations({
      limit: 5,
      seed_tracks: seed_tracks.slice(0, 5), // Spotify only allows up to 5 seed tracks
      target_energy: Math.max(0, Math.min(1, target_energy)), // Ensure between 0 and 1
      target_valence: Math.max(0, Math.min(1, target_valence)), // Ensure between 0 and 1
      min_popularity: 20, // Avoid completely unknown tracks
    });

    const tracks = response.body.tracks;
    const audioFeatures = await this.spotifyApi.getAudioFeaturesForTracks(tracks.map(t => t.id));

    return tracks.map((track, index) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      uri: track.uri,
      energy: audioFeatures.body.audio_features[index].energy,
      valence: audioFeatures.body.audio_features[index].valence,
      duration_ms: track.duration_ms,
    }));
  }

  async getTrackFeatures(trackId: string) {
    const response = await this.spotifyApi.getAudioFeaturesForTrack(trackId);
    return response.body;
  }

  async getCurrentPlayback() {
    const response = await this.spotifyApi.getMyCurrentPlaybackState();
    return response.body;
  }

  async addToQueue(trackUri: string) {
    await this.spotifyApi.addToQueue(trackUri);
  }

  async skipToNext() {
    await this.spotifyApi.skipToNext();
  }

  async adjustPlaybackParameters(trackUri: string, parameters: {
    tempo_percent?: number;
    pitch_semitones?: number;
  }) {
    // Note: This is a theoretical implementation as Spotify's API doesn't directly
    // support real-time audio modifications. You would need additional audio
    // processing capabilities for this feature.
    throw new Error('Real-time audio modification not supported by Spotify API');
  }
} 