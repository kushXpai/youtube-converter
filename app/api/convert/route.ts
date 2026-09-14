import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Extend Vercel function execution timeout for slow mobile conversions
export const maxDuration = 30;

// Helper function to extract the 11-character YouTube video ID
function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const inputUrl = searchParams.get('url');
  const format = searchParams.get('format') || 'mp3';

  if (!inputUrl) {
    return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
  }

  const videoId = extractVideoId(inputUrl);
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube URL provided' }, { status: 400 });
  }

  try {
    const response = await axios.get(`https://${process.env.RAPIDAPI_HOST}/audio`, {
      params: {
        id: videoId,
        ext: format === 'mp4' ? 'mp4' : 'mp3',
        quality: '128kbps',
      },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
        'Content-Type': 'application/json',
      },
      timeout: 25000, // 25s timeout limit for the external API call
    });

    const data = response.data;
    const downloadLink = data.linkDownload || data.linkStream;

    if (downloadLink) {
      return NextResponse.json({
        title: data.title || 'YouTube Media',
        author: data.author,
        downloadUrl: downloadLink,
        format: format,
      });
    }

    return NextResponse.json(
      { error: data.msg || data.message || 'Could not extract download link from server response.' },
      { status: 400 }
    );
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.response?.data?.msg || err.message;
    return NextResponse.json({ error: errorMsg || 'Conversion failed' }, { status: 500 });
  }
}