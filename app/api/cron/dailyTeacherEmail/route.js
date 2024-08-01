import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import moment from 'moment-timezone';
import fetchTimeout from '@/components/util_function/fetch';

export async function GET() {
	await notifyTeachers()
	return NextResponse.json({ ok: true });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const brevoApiKey = process.env.EMAIL_TOKEN;
const brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

const supabase = createClient(supabaseUrl, supabaseKey);

const fetchClassesForNextDay = async () => {
	const tomorrowDay = moment().tz('Asia/Kolkata').add(1, 'days').format('dddd');

	const { data, error } = await supabase
		.from('classes')
		.select('*')
		.like("days", `%${tomorrowDay}%`);

	if (error) {
		console.error('Error fetching classes:', error);
		return [];
	}

	return data;
};

const fetchTeachers = async () => {
	const { data, error } = await supabase
		.from('teachers')
		.select('*');

	if (error) {
		console.error('Error fetching teachers:', error);
		return [];
	}

	return data;
};

const sendEmail = async (teacher_data) => {

	const data = {
		"sender": {
			"email": "no-reply@classaccess.tech",
			"name": "Class Access"
		},
		"templateId": 6,
		"params": {
			"teacher_name": teacher_data.teacher_name,
			"class": teacher_data.classes,
		},
		"to": [
			{
				"email": teacher_data.teacher_email,
				"name": teacher_data.teacher_name
			}
		],
	}

	const signal = new AbortController().signal
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

	if (!response.ok) {
		console.error('Error sending email:', await response.text());
	} else {
		console.log('Email sent successfully');
	}
};

const notifyTeachers = async () => {
	const classes = await fetchClassesForNextDay();
	const teachers = await fetchTeachers();

	const parseTime = (timeStr) => {
		const [hours, minutes, seconds] = timeStr.split(':');
		const date = new Date();
		date.setHours(parseInt(hours, 10));
		date.setMinutes(parseInt(minutes, 10));
		date.setSeconds(parseInt(seconds, 10));
		return date;
	};

	// Function to sort classes by start time
	const sortClassesByTime = (classes) => {
		return classes.sort((a, b) => {
			const timeA = parseTime(a.start_time);
			const timeB = parseTime(b.start_time);
			return timeA - timeB;
		});
	};

	// Function to format time for display
	const formatTime = (timeStr) => {
		const [hours, minutes] = timeStr.split(':');
		let hour = parseInt(hours, 10);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		hour = hour % 12;
		hour = hour ? hour : 12; // the hour '0' should be '12'
		return `${hour}:${minutes} ${ampm}`;
	};

	// Main function to organize and sort classes for each teacher
	const organizeTeacherClasses = (teachers, classes) => {
		return teachers.map(teacher => {
			const teacherClasses = classes.filter(cls => cls.teacher_id === teacher.id);
			const sortedClasses = sortClassesByTime(teacherClasses);

			const simplifiedClasses = sortedClasses.map(cls => ({
				name: cls.name,
				start_time: formatTime(cls.start_time),
				end_time: formatTime(cls.end_time)
			}));

			return {
				teacher_name: `${teacher.first_name} ${teacher.last_name}`,
				teacher_id: teacher.id,
				teacher_email: teacher.email,
				classes: simplifiedClasses
			};
		});
	};

	const results = organizeTeacherClasses(teachers, classes);

	for (const result of results) {
		if (result.classes.length > 0) {
			await sendEmail(result);
		}
	}
};
