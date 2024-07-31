// /api/emails/resend_activation

import { NextResponse } from 'next/server';
import fetchTimeout from '@/components/util_function/fetch';
import verifyJWT from '@/components/util_function/verifyJWT';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
	const token = request.headers.get("jwt");
	const decodedJWT = verifyJWT(token);
	if (!decodedJWT) {
		return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
	}

	const email = request.headers.get('email');
	const teacherName = request.headers.get('teacherName');

	const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
		type: 'recovery',
		email: email,
		options: {
			redirectTo: 'https://classaccess.tech/activate',
		}
	})
	if (linkError) {
		return "Email Failed"
	}

	const data = {
		"sender": {
			"email": "no-reply@classaccess.tech",
			"name": "Class Access"
		},
		"templateId": 2,
		"params": {
			"teacher_name": teacherName,
			"url": linkData.properties.action_link,
		},
		"to": [
			{
				"email": email,
				"name": email
			}
		],
	}

	const signal = new AbortController().signal;
	const response = await fetchTimeout(`https://api.brevo.com/v3/smtp/email`, 2000, {
		signal,
		method: 'POST',
		headers: {
			'accept': 'application/json',
			'content-type': 'application/json',
			'api-key': process.env.EMAIL_TOKEN,
		},
		'body': JSON.stringify(data),
	})

	if (response.status !== 201) {
		console.log("Error Sending Email Welcome Email");
		console.log(await response.json());
		return NextResponse.json({ error: 'Email Failed' }, { status: 500 });
	}
	return NextResponse.json({ message: 'Email Sent' }, { status: 200 });
}
