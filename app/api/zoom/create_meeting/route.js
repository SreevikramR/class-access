import axios from 'axios';
import qs from 'querystring';

const zoomAuthUrl = 'https://zoom.us/oauth/token';
const zoomMeetingUrl = 'https://api.zoom.us/v2/users/me/meetings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;

  try {
    const tokenResponse = await axios.post(
      zoomAuthUrl,
      qs.stringify({
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const meetingResponse = await axios.post(
      zoomMeetingUrl,
      {
        topic: 'New Meeting',
        type: 1
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const meetingLink = meetingResponse.data.join_url;

    res.status(200).json({ meetingLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Zoom meeting' });
  }
}
