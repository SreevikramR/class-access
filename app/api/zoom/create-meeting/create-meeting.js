import { Auth } from '@zoom/auth-sdk';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const auth = new Auth({
        accountId: process.env.ZOOM_ACCOUNT_ID,
        clientId: process.env.ZOOM_CLIENT_ID,
        clientSecret: process.env.ZOOM_CLIENT_SECRET,
      });

      const token = await auth.getAccessToken();

      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        {
          topic: 'My Zoom Meeting',
          type: 2, // Scheduled meeting
          start_time: new Date().toISOString(),
          duration: 60, // Duration in minutes
          timezone: 'America/New_York',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
      res.status(500).json({ error: 'Failed to create Zoom meeting' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}