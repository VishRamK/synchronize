import { NextApiRequest, NextApiResponse } from 'next';
import { MLService } from '../../lib/ml-service';
import { CrowdAnalyzer } from '../../lib/crowd-analyzer';
import { SpotifyService } from '../../lib/spotify';
import dbConnect from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { crowdData, currentTrack, userId } = req.body;

    if (!crowdData?.audio || !crowdData?.video || !currentTrack || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const crowdAnalyzer = new CrowdAnalyzer();
    const spotifyService = new SpotifyService();
    const mlService = new MLService(spotifyService);

    // Initialize ML service
    await mlService.initialize();

    // Analyze crowd
    const energy = await crowdAnalyzer.analyzeCrowdEnergy(crowdData.audio);
    const mood = await crowdAnalyzer.analyzeCrowdMood(crowdData.video);

    // Get song suggestions
    const suggestions = await mlService.suggestNextSong(
      mood.sentiment,
      energy,
      [currentTrack]
    );

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error in song suggestion:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? 
        error instanceof Error ? error.message : 'Unknown error' 
        : undefined 
    });
  }
} 