import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const format = searchParams.get('format') || 'mp3';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Extract YouTube Video ID
  const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (!videoIdMatch) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }
  const videoId = videoIdMatch[1];

  try {
    // Calling RapidAPI (YouTube MP3 / MP4 API)
    const response = await axios.get(`https://${process.env.RAPIDAPI_HOST}/dl`, {
      params: { id: videoId },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': process.env.RAPIDAPI_HOST,
      },
    });

    if (response.data.status === 'ok') {
      return NextResponse.json({
        title: response.data.title,
        downloadUrl: response.data.link,
        format: format,
      });
    }

    return NextResponse.json({ error: 'Failed to fetch conversion link.' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}