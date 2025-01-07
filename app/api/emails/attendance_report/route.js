// app/api/emails/attendance_report/route.js

import { NextResponse } from 'next/server';
import fetchTimeout from '@/components/util_function/fetch';
import verifyJWT from '@/components/util_function/verifyJWT';

export async function POST(request) {
	const token = request.headers.get("jwt");
	const decodedJWT = verifyJWT(token);
	if (!decodedJWT) {
		return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
	}

	const email = request.headers.get('email');
	const teacherEmail = request.headers.get('teacherEmail');
	const teacherName = request.headers.get('teacherName');
	const pdfBase64 = (await request.json()).pdf
	const fileName = request.headers.get('fileName');
	const className = request.headers.get('className');
	const controller = new AbortController()
	const { signal } = controller;

	const data = {
		"sender": {
			"email": "no-reply@classaccess.tech",
			"name": "Class Access"
		},
		"templateId": 9,
		"params": {
			"teacher_name": teacherName,
			"class_name": className,
		},
		"to": [
			{
				"email": email,
				"name": email
			}
		],
		"cc": [
			{
				"email": teacherEmail,
				"name": teacherName
			}
		],
		"attachment": [{
			"content": pdfBase64,
			"name": fileName,
		}]
	}

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
		console.log("Error Sending Attendance Report Email");
		console.log(await response.json());
		return NextResponse.json({ error: 'Email Failed' }, { status: 500 });
	}
	return NextResponse.json({ message: 'Email Sent' }, { status: 200 });
}
