// app/api/meetings/create/gmeet/route.js

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fetchTimeout from '@/components/util_function/fetch';
import verifyJWT from '@/components/util_function/verifyJWT';
import { google } from 'googleapis';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
	const jwt = request.headers.get('jwt');
	const decodedJWT = verifyJWT(jwt);
	const teacherUUID = decodedJWT?.sub;
	if (!decodedJWT) {
		return NextResponse.json({message: "Invalid Token"}, {status: 401});
	}

	const accessToken = request.headers.get('provider_access_token');
	const refreshToken = request.headers.get('provider_refresh_token');

	const { data, error } = await supabase.from('teachers').select('email').eq('id', teacherUUID);
	if (error) {
		return NextResponse.json({ error: 'Server Error' }, { status: 500 });
	} else if (data.length == 0) {
		return NextResponse.json({ error: 'Teacher not found' }, { status: 500 });
	}

	const oauth2client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'https://classaccess.tech/')
	oauth2client.setCredentials({access_token: accessToken, refresh_token: refreshToken})
	const meet = google.calendar({version: 'v3', auth: oauth2client});
	const event = {
		summary: 'Meeting',
		location: 'Online',
		description: 'Meeting with student name',
		start: {
			dateTime: '2005-06-25T15:00:00-07:00',
			timeZone: 'Asia/Kolkata',
		},
		end: {
			dateTime: '2005-06-25T16:00:00-07:00',
			timeZone: 'Asia/Kolkata',
		},
		conferenceData: {
			createRequest: {
				conferenceSolutionKey: {
					type: "hangoutsMeet"
				},
				requestId: Date.now().toString()
			}
		},
	}

	try {
		const response = await meet.events.insert({
			calendarId: 'primary',
			resource: event,
			conferenceDataVersion: 1
		})
		if (!response.data.hangoutLink) {
			return NextResponse.json({ error: 'Server Error1' }, { status: 500 });
		}
		const meetingID = response.data.id;
		const meetingLink = response.data.hangoutLink;
		// Delete the event
		const response2 = await meet.events.delete({
			calendarId: 'primary',
			eventId: meetingID
		})
		return NextResponse.json({"meetingLink": meetingLink}, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Server Error2' }, { status: 500 });
	}
}
