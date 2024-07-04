import { useState } from 'react';
import { Button } from './ui/button';
import axios from 'axios';
import { supabaseClient } from './util_function/supabaseCilent';
import fetchTimeout from './util_function/fetch';

const ZoomButton = () => {
	const [meetingLink, setMeetingLink] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const createMeeting = async () => {
		setLoading(true);
		setError(null);

		try {
			console.log('Attempting to create meeting...');
			const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
			const supabase_refresh = (await supabaseClient.auth.getSession()).data.session.refresh_token;
			
			const controller = new AbortController()
			const { signal } = controller;
			const url = new URL(`${window.location.origin}/api/zoom/create_meeting`)
			const response = await fetchTimeout(url, 10000, { signal, method: 'POST', headers: { 'jwt': jwt, 'supabase_refresh': supabase_refresh } });

			setMeetingLink((await response.json()).meetingLink);
		} catch (err) {
			console.error('Error details:', err.response ? err.response.data : err);
			setError(err.message || 'An error occurred while creating the meeting');
		} finally {
			setLoading(false);
		}
	};
	return (
		<div>
			<Button onClick={createMeeting} disabled={loading}>
				{loading ? 'Creating...' : 'Create Zoom Meeting'}
			</Button>
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