import axios from 'axios';
import { NextResponse } from 'next/server';

const zoomMeetingUrl = 'https://api.zoom.us/v2/users/me/meetings';
const retrieve_tokens_url = new URL('https://classaccess.tech/api/zoom/retrieve_tokens');

export async function POST(request) {
	let refresh_token = ""
	try {
		// const accessToken = "eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjZhNzM2NWNiLTk1ZDYtNGEyNi1hZmYyLTVjNTZlMDA0MmI5NSJ9.eyJ2ZXIiOjksImF1aWQiOiI0ODEyNzk1YzY3NWViYjE0OWNhZTZlNjJhN2EwZDkzZiIsImNvZGUiOiJwVFBkN0FQOUVaNFVoZVdSVG9XUjFpZkVmM1Q4ZzdtRlEiLCJpc3MiOiJ6bTpjaWQ6dEpzbWRhbHdTN2lpeG5IYm5naHNydyIsImdubyI6MCwidHlwZSI6MCwidGlkIjowLCJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJMQmxYR3B5OFFueVVWOGh0YVBYcDR3IiwibmJmIjoxNzE5MjM0NDU2LCJleHAiOjE3MTkyMzgwNTYsImlhdCI6MTcxOTIzNDQ1NiwiYWlkIjoiTXhDSHlkTTlRSENnZ2I2MWNDblVqQSJ9.inDp5Aw_5Qw9_vi8Hbu4aN-Kz-MOrH3HWqvpsEoSk7RmhwtSU5TdUFQjNVNdTVBU4CLHR3QtFmELsUgu1IEKPQ";
		const jwt = request.headers.get('jwt');
		const supabase_refresh = request.headers.get('supabase_refresh');

		const tokenData = await axios.get(retrieve_tokens_url,
			{ headers: { 'jwt': jwt, 'supabase_refresh': supabase_refresh } }
		)
		let accessToken = tokenData.data[0].access_token
		refresh_token = tokenData.data[0].refresh_token

		
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
		return NextResponse.json({ meetingLink }, { status: 200 });
	} catch (error) {
		if (error.response.data.code === 124) {
			return NextResponse.json({ error: 'Invalid access token', refresh_token: refresh_token }, { status: 401 });
		}
		return NextResponse.json({ error }, { status: 500 });
	}
}
