import axios from 'axios';
import qs from 'querystring';

const zoomAuthUrl = 'https://zoom.us/oauth/token';
const zoomMeetingUrl = 'https://api.zoom.us/v2/users/me/meetings';

export async function POST(req, res) {

	try {
		const accessToken = "eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjZhNzM2NWNiLTk1ZDYtNGEyNi1hZmYyLTVjNTZlMDA0MmI5NSJ9.eyJ2ZXIiOjksImF1aWQiOiI0ODEyNzk1YzY3NWViYjE0OWNhZTZlNjJhN2EwZDkzZiIsImNvZGUiOiJwVFBkN0FQOUVaNFVoZVdSVG9XUjFpZkVmM1Q4ZzdtRlEiLCJpc3MiOiJ6bTpjaWQ6dEpzbWRhbHdTN2lpeG5IYm5naHNydyIsImdubyI6MCwidHlwZSI6MCwidGlkIjowLCJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJMQmxYR3B5OFFueVVWOGh0YVBYcDR3IiwibmJmIjoxNzE5MjM0NDU2LCJleHAiOjE3MTkyMzgwNTYsImlhdCI6MTcxOTIzNDQ1NiwiYWlkIjoiTXhDSHlkTTlRSENnZ2I2MWNDblVqQSJ9.inDp5Aw_5Qw9_vi8Hbu4aN-Kz-MOrH3HWqvpsEoSk7RmhwtSU5TdUFQjNVNdTVBU4CLHR3QtFmELsUgu1IEKPQ";

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

		return new Response(JSON.stringify(meetingLink), {
			headers: { 'Content-Type': 'application/json' },
			status: 200
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify(error.response.data), {
			headers: { 'Content-Type': 'application/json' },
			status: 500,
		});
	}
}
