// app/api/students/new_student

import {createClient} from '@supabase/supabase-js';
import {NextResponse} from 'next/server';
import verifyJWT from '@/components/util_function/verifyJWT';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import generateRandomString from '@/components/util_function/generateRandomString';
import fetchTimeout from '@/components/util_function/fetch';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST Endpoint
// Endpoint can create student account, create proxies and send welcoming and onboarding emails
// Headers needed for this endpoint:
//// jwt: JWT Token
//// teacher_name: Teacher Name
//// email: Student Email
//// notes: Notes
//// classes_left: Classes Left
//// class_id: Class ID
//// class_code: Class Code
//// class_name: Class Name

export async function POST(request) {
	const token = request.headers.get('jwt');
	const decodedJWT = verifyJWT(token);
	const teacherUUID = decodedJWT?.sub;
	if (!decodedJWT) {
		return NextResponse.json({message: "Invalid Token"}, {status: 401});
	}
	
	const teacher_name = request.headers.get('teacher_name');
	const email = request.headers.get('email');
	const notes = request.headers.get('notes');
	const classes_left = request.headers.get('classes_left');
	const class_id = request.headers.get('class_id');
	const class_code = request.headers.get('class_code');
	const class_name = request.headers.get('class_name');

	const studentPassword = generateRandomString(10);
	
	const createStudentData = await createNewStudent(email, studentPassword);
	if (createStudentData?.error === true) {
		return NextResponse.json({message: "Error Adding Student"}, {status: 500});
	}
	if (createStudentData.error === "User Exists") {
		// User Already Exists, Need to Create a proxy
		const {
			data: studentProxyData,
			error: studentProxyError
		} = await supabase.from('student_proxies').select().eq('email', email).eq('teacher_id', teacherUUID);
		if (studentProxyError) {
			console.log("Error Fetching Student Proxy Data: 'student_proxies' Table");
			console.log(studentProxyError);
			return NextResponse.json({message: "Error Adding Student"}, {status: 500});
		}
		
		// Student Proxy Already Exists, need to update the classes_left
		if (studentProxyData.length > 0) {
			const classes_left_jb = studentProxyData[0].classes_left;
			classes_left_jb[class_id] = classes_left;
			const {
				data,
				error
			} = await supabase.from('student_proxies').update({classes_left: classes_left_jb}).eq('email', email).eq('teacher_id', teacherUUID).select()
			if (error) {
				console.log("Error Updating Student Data: 'student_proxies' Table");
				console.log(error);
				return NextResponse.json({message: "Error Adding Student"}, {status: 500});
			}

			// Add student proxy to class using the funciton
			const studentProxyID = studentProxyData[0].id;
			const addStudentProxyToClassStatus = await addStudentProxyToClass(studentProxyID, class_id, teacherUUID);
			if (addStudentProxyToClassStatus === "Error") {
				return NextResponse.json({message: "Error Adding Student"}, {status: 500});
			}
			
			// Send Onboarding Email
			const onboardingEmailStatus = await sendOnboardingEmail(email, class_code, teacher_name, class_name);
			if (onboardingEmailStatus === "Email Failed") {
				return NextResponse.json({message: "Error Sending Email"}, {status: 500});
			}
			
			return NextResponse.json({message: "Student Added"}, {status: 200});
		}
		
		// Student Proxy Does Not Exist, Need to Create a new proxy
		const studentInsertProxyData = await addStudentProxy(createStudentData.id, teacherUUID, class_id, classes_left, email, notes);
		if (studentInsertProxyData === "Error") {
			return NextResponse.json({message: "Error Adding Student"}, {status: 500});
		}

		const studentProxyID = studentInsertProxyData[0].id;
		const addStudentProxyToClassStatus = await addStudentProxyToClass(studentProxyID, class_id, teacherUUID);
		if (addStudentProxyToClassStatus === "Error") {
			return NextResponse.json({ message: "Error Adding Student" }, { status: 500 });
		}
		
		// Send Onboarding Email
		const onboardingEmailStatus = await sendOnboardingEmail(email, class_code, teacher_name, class_name);
		if (onboardingEmailStatus === "Email Failed") {
			return NextResponse.json({message: "Error Sending Email"}, {status: 500});
		}
		
		return NextResponse.json({message: "Student Added"}, {status: 200});
	}
	
	// Add Student to Student Table
	const studentUUID = createStudentData.id;
	const studentTableData = await addToStudentTable(email, studentUUID);
	if (studentTableData === "Error") {
		return NextResponse.json({message: "Error Adding Student"}, {status: 500});
	}
	
	// Add Student to Student Proxy Table
	const studentProxyData = await addStudentProxy(studentUUID, teacherUUID, class_id, classes_left, email, notes);
	if (studentProxyData === "Error") {
		return NextResponse.json({message: "Error Adding Student"}, {status: 500});
	}
	
	// Send Welcome Email
	const welcomeEmailStatus = await sendWelcomeEmail(teacher_name, email, studentPassword);
	if (welcomeEmailStatus === "Email Failed") {
		return NextResponse.json({message: "Error Sending Email"}, {status: 500});
	}

	const studentProxyID = studentProxyData[0].id;
	const addStudentProxyToClassStatus = await addStudentProxyToClass(studentProxyID, class_id, teacherUUID);
	if (addStudentProxyToClassStatus === "Error") {
		return NextResponse.json({ message: "Error Adding Student" }, { status: 500 });
	}
	
	// Send Onboarding Email
	const onboardingEmailStatus = await sendOnboardingEmail(email, class_code, teacher_name, class_name);
	if (onboardingEmailStatus === "Email Failed") {
		return NextResponse.json({message: "Error Sending Email"}, {status: 500});
	}
	
	return NextResponse.json({message: "Student Added"}, {status: 200});
}

// Creates a new student Account
const createNewStudent = async (studentEmail, password) => {
	console.log(studentEmail, password);
	const {data, error} = await supabase.auth.admin.createUser({
		email: studentEmail,
		password: password,
		email_confirm: true,
	})

	// Check if User already exists
	if (error?.code === 'email_exists') {
		const {data: userData, error: userError} = await supabase.from('students').select('id').eq('email', studentEmail);
		return {"error": "User Exists", "id": userData[0].id}
	}
	if (error) {
		console.log("Error Creating Student Account");
		console.log(error);
		console.log(studentEmail, password);
		return { "error": true, "message": error }
	}
	return {"error": false, id: data.user.id}
}

// Adds the student to the student table
const addToStudentTable = async (studentEmail, studentID) => {
	const {data, error} = await supabase.from('students').insert([{id: studentID, email: studentEmail}]).select()	
	if (error) {
		console.log("Error Inserting Student Data: 'students' Table");
		console.log(error);
		return "Error"
	}
	return data;
}

// Adds the student to the student proxy table or updates the classes_left if the student proxy row already exists
const addStudentProxy = async (studentUUID, teacherUUID, class_id, classes_left, studentEmail, notes) => {
	// Get row from student proxy where student_id = studentUUID and teacher_id = teacherUUID
	const {
		data: studentProxyData,
		error: studentProxyError
	} = await supabase.from('student_proxies').select().eq('student_id', studentUUID).eq('teacher_id', teacherUUID);
	if (studentProxyError) {
		console.log("Error Fetching Student Proxy Data: 'student_proxies' Table");
		console.log(studentProxyError);
		return "Error"
	}
	if (studentProxyData.length > 0) {
		// Student Proxy Already Exists, need to update the classes_left
		let classes_left_jb = studentProxyData[0].classes_left;
		classes_left_jb[class_id] = classes_left;
		let status_jb = studentProxyData[0].status;
		status_jb[class_id] = "Invited";
		const {
			data,
			error
		} = await supabase.from('student_proxies').update({classes_left: classes_left_jb, status: status_jb}).eq('student_id', studentUUID).eq('teacher_id', teacherUUID).select()
		if (error) {
			console.log("Error Updating Student Data: 'student_proxies' Table");
			console.log(error);
			return "Error"
		}
		return data;
	}
	
	let classes_left_jb = {}
	classes_left_jb[class_id] = classes_left;
	let status_jb = {}
	status_jb[class_id] = "Invited";
	const {data: data, error: error} = await supabase.from('student_proxies').insert([{
		student_id: studentUUID,
		teacher_id: teacherUUID,
		classes_left: classes_left_jb,
		email: studentEmail,
		notes: notes,
		hasJoined: false,
		status: status_jb
	}]).select()

	if (error) {
		console.log("Error Inserting Student Data: 'student_proxies' Table");
		console.log(error);
		return "Error"
	}
	// Add student proxy ID to student table proxy_ids array
	const studentProxyID = data[0].id;
	const { data: studentData, error: studentError } = await supabase.from('students').select("*").eq('id', studentUUID)
	if (studentError) {
		console.log("Error Fetching Student Data: 'students' Table");
		console.log(studentError);
		return "Error"
	}
	let proxy_ids = studentData[0].proxy_ids;
	if (!proxy_ids) {
		proxy_ids = [];
	}
	proxy_ids.push(studentProxyID);

	const { data: studentUpdateData, error: studentUpdateError } = await supabase.from('students').update({proxy_ids: proxy_ids}).eq('id', studentUUID).select()
	if (studentUpdateError) {
		console.log("Error Updating Student Data: 'students' Table");
		console.log(studentUpdateError);
		return "Error"
	}
	return data;
}

// Add student proxy id to the class
const addStudentProxyToClass = async (studentProxyID, classID, teacherUUID) => {
	const { data: classData, error: classError } = await supabase.from('classes').select('student_proxy_ids').eq('id', classID).single()
	if (classError) {
		console.log("Error Fetching Class Data: 'classes' Table");
		console.log(classError);
		return "Error"
	}
	let studentProxyIDArray = classData.student_proxy_ids;
	if (studentProxyIDArray === null) {
		studentProxyIDArray = [];
	}
	if (!studentProxyIDArray.includes(studentProxyID)) {
		studentProxyIDArray.push(studentProxyID);
	}
	const { data: classUpdateData, error: classUpdateError } = await supabase.from('classes').update({ student_proxy_ids: studentProxyIDArray }).eq('id', classID).select()
	if (classUpdateError) {
		console.log("Error Updating Class Data: 'classes' Table");
		console.log(classUpdateError);
	}
	const { data: teacher, error: teacherror } = await supabase.from('teachers').select('student_proxy_ids').eq('id', teacherUUID).single()
	if (teacherror) {
		console.log("Error Fetching Class Data: 'teacher' Table");
		console.log(classError);
		return "Error"
	}
	let studentProxyIDArrayt = teacher.student_proxy_ids;
	if (studentProxyIDArrayt === null) {
		studentProxyIDArrayt = [];
	}
	if (!studentProxyIDArrayt.includes(studentProxyID)) {
		studentProxyIDArrayt.push(studentProxyID);
	}
	const { data: teacherup, error: teachererror } = await supabase.from('teachers').update({ student_proxy_ids: studentProxyIDArrayt }).eq('id', teacherUUID).select()
	if (teachererror) {
		console.log("Error Updating Class Data: 'teachers' Table");
		console.log(classUpdateError);
		return "Error"
	}
	return true;
}

// Sends a welcome email to the student
const sendWelcomeEmail = async (teacherName, email, password) => {
	const controller = new AbortController()
	const { signal } = controller;

	const data = {
		"sender": {
			"email": "no-reply@classaccess.tech",
			"name": "Class Access"
		},
		"templateId": 2,
		"params": {
			"teacher_name": teacherName,
			"url": 'https://classaccess.tech/activate',
			"email": email,
			"password": password
		},
		"to": [
			{
				"email": email,
				"name": email
			}
		],
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
		console.log("Error Sending Email Welcome Email");
		console.log(await response.json());
		return "Email Failed"
	}
	return "Email Sent"
}

// Sends an onboarding email to the student
const sendOnboardingEmail = async (email, classCode, teacherName, className) => {
	const link = `https://classaccess.tech/join_class/${classCode}`;
	const controller = new AbortController()
	const { signal } = controller;

	const data = {
		"sender": {
			"email": "no-reply@classaccess.tech",
			"name": "Class Access"
		},
		"templateId": 1,
		"params": {
			"url": link,
			"class_name": className,
			"teacher_name": teacherName
		},
		"to": [
			{
				"email": email,
				"name": email
			}
		],
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
		console.log("Error Sending Email Welcome Email");
		console.log(await response.json());
		return "Email Failed"
	}
	return "Email Sent"
}