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

	const { data, error } = await supabase.from('teachers').select('email').eq('id', teacherUUID);
	if (error) {
		return NextResponse.json({ error: 'Server Error' }, { status: 500 });
	} else if (data.length == 0) {
		return NextResponse.json({ error: 'Teacher not found' }, { status: 500 });
	}

	const oauth2client = new google.auth.OAuth2('clientID', 'clientSecret', 'redirectURI')
	oauth2client.setCredentials({access_token: 'accessToken', refresh_token: 'refreshToken'})
	const meet = google.calendar({version: 'v3', auth: oauth2client});
	const event = {
		summary: 'Meeting',
		location: 'Online',
		description: 'Meeting with student',
		start: {
			dateTime: '2022-01-01T09:00:00-07:00',
			timeZone: 'Asia/Kolkata',
		},
		end: {
			dateTime: '2022-01-01T10:00:00-07:00',
			timeZone: 'Asia/Kolkata',
		}
	}

	try {
		const response = await meet.events.insert({
			calendarId: 'primary',
			resource: event
		})
		console.log(response.data)
	} catch {
		console.log("Error")
	}


	if (error) {
		return NextResponse.json({ error: 'Email Failed' }, { status: 500 });
	}
	return NextResponse.json({ message: 'Email Sent' }, { status: 200 });
}
