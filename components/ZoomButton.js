import { useState } from 'react';
import axios from 'axios';
const ZoomButton = () => {
  const [meetingLink, setMeetingLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMeeting = async () => {
  setLoading(true);
  setError(null);

  try {
    console.log('Attempting to create meeting...');
    const response = await axios.post('/api/zoom/create_meeting');
    console.log('Response:', response);
    setMeetingLink(response.data.meetingLink);
  } catch (err) {
    console.error('Error details:', err.response ? err.response.data : err);
    setError(err.message || 'An error occurred while creating the meeting');
  } finally {
    setLoading(false);
  }
};
  return (
    <div>
      <button onClick={createMeeting} disabled={loading}>
        {loading ? 'Creating...' : 'Create Zoom Meeting'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {meetingLink && (
        <p>
          Meeting created! <a href={meetingLink} target="_blank" rel="noopener noreferrer">Join here</a>
        </p>
      )}
    </div>
  );
};

export default ZoomButton;
