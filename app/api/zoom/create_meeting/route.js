import jwt from 'jsonwebtoken';
import axios from 'axios';

export async function POST(req) {
  try {
    const payload = {
      iss: process.env.ZOOM_API_KEY,
      exp: ((new Date()).getTime() + 5000)
    };
    const token = jwt.sign(payload, process.env.ZOOM_API_SECRET);

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: 'My Zoom Meeting',
        type: 2,
        start_time: new Date().toISOString(),
        duration: 60,
        timezone: 'America/New_York',
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating Zoom meeting:', error.response ? error.response.data : error.message);
    return new Response(JSON.stringify({ error: 'Failed to create Zoom meeting' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}