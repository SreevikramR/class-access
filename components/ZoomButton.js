import { useState } from 'react';

const ZoomButton = () => {
  const [meetingLink, setMeetingLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMeeting = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/zoom/create_meeting' , {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();
      setMeetingLink(data.meetingLink);
    } catch (err) {
      setError(err.message);
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
