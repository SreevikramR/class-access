// app/api/users/new_student/route.js

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { MailtrapClient } from 'mailtrap';
import verifyJWT from '@/components/util_function/verifyJWT';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST Endpoint
// Headers needed for this endpoint:
//// jwt: JWT Token
//// refresh_token: Refresh Token
//// teacher_name: Teacher Name
//// email: Student Email
//// notes: Notes
//// classes_left: Classes Left
//// class_id: Class ID
//// class_code: Class Code
//// class_name: Class Name

// Creates a new student Account
const createNewStudent = async (studentEmail) => {
    const { data, error } = await supabase.auth.signUp({
        email: studentEmail,
        password: process.env.DEFAULT_PASSWORD,
    })
    
    // Check if User already exists
    if (error?.code === 'user_already_exists') {
        return "User Exists"
    }
}

// Adds the student to the student table
const addToStudentTable = async (studentEmail) => {
    const { data, error } = await supabase.from('students').insert([{ email: studentEmail }]).select()
    
    if (error) {
        console.log("Error Inserting Student Data: 'students' Table");
        console.log(error);
        return "Error"
    }
    return data;
}

// Adds the student to the student proxy table or updates the classes_left if the student proxy row already exists
const addStudentProxy = async (studentUUID, teacherUUID, class_id, classes_left, studentEmail) => {
    // Get row from student proxy where student_id = studentUUID and teacher_id = teacherUUID
    const { data: studentProxyData, error: studentProxyError } = await supabase.from('student_proxies').select().eq('student_id', studentUUID).eq('teacher_id', teacherUUID);
    if (studentProxyError) {
        console.log("Error Fetching Student Proxy Data: 'student_proxies' Table");
        console.log(studentProxyError);
        return "Error"
    }
    if (studentProxyData.length > 0) {
        // Student Proxy Already Exists, need to update the classes_left
        const classes_left_jb = studentProxyData[0].classes_left;
        classes_left_jb[class_id] = classes_left;
        const { data, error } = await supabase.from('student_proxies').update({ classes_left: classes_left_jb }).eq('student_id', studentUUID).eq('teacher_id', teacherUUID).select()
        if (error) {
            console.log("Error Updating Student Data: 'student_proxies' Table");
            console.log(error);
            return "Error"
        }
        return data;
    }
    
    let classes_left_jb = {}
    classes_left_jb[class_id] = classes_left;
    const { data, error } = await supabase.from('student_proxies').insert([{ 
        student_id: studentUUID,
        teacher_id: teacherUUID,
        classes_left: classes_left_jb,
        email: studentEmail,
    }]).select()

    if (error) {
        console.log("Error Inserting Student Data: 'student_proxies' Table");
        console.log(error);
        return "Error"
    }
    return data;
}

// Sends a welcome email to the student
const sendWelcomeEmail = async ( jwt, teacherName, refresh_token, email ) => {
    const TOKEN = process.env.EMAIL_TOKEN;
    const ENDPOINT = process.env.EMAIL_ENDPOINT;
    const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

    const link = `https://classaccess.tech/activate#jwt=${jwt}&refresh_token=${refresh_token}`;
    const sender = {
        email: "no-reply@classaccess.tech",
        name: "Class Access",
    };
    const recipients = [{ email: email }];

    try {
        client.send({
            from: sender,
            to: recipients,
            template_uuid: "b4adc5e7-c8c3-4b1d-9bbf-556cd1cc7a00",
            template_variables: {
                "teacher_name": teacherName,
                "activation_link": link
            }
        })
        return "Email sent"
    } catch (error) {
        console.log("Error Sending Email Welcome Email");
        console.log(error);
        return "Email Failed"
    }
}

const sendOnboardingEmail = async (email, classCode, teacherName, className) => {
    const link = `https://classaccess.tech/join_class/${classCode}`;
    const sender = {
        email: "no-reply@classaccess.tech",
        name: "Class Access",
    };
    const recipients = [{ email: email }];

    try {
        client.send({
            from: sender,
            to: recipients,
            template_uuid: "6f61e827-4cf8-4a79-8392-0aec29839e7c",
            template_variables: {
                "teacher_name": teacherName,
                "class_name": className,
                "next_step_link": link
            }
        })
        return "Email sent"
    } catch (error) {
        console.log("Error Sending Email Welcome Email");
        console.log(error);
        return "Email Failed"
    }
}

export async function POST(request) {
    const token = request.headers.get('jwt');
    const refresh_token = request.headers.get('refresh_token');

    const decodedJWT = verifyJWT(token);
    const teacherUUID = decodedJWT?.sub;
    if (!decodedJWT) {
        return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    const teacher_name = request.headers.get('teacher_name');
    const email = request.headers.get('email');
    const notes = request.headers.get('notes');
    const classes_left = request.headers.get('classes_left');
    const class_id = request.headers.get('class_id');
    const class_code = request.headers.get('class_code');
    const class_name = request.headers.get('class_name');

    const createStudentData = await createNewStudent(email);
    if (createStudentData === "User Exists") {
        // User Already Exists, Need to Create a proxy
        // Check if student has a proxy for the teacher

        return NextResponse.json({ message: "User Exists" }, { status: 400 });
    }

    // Add Student to Student Table
    const studentTableData = await addToStudentTable(email);
    const studentUUID = studentTableData[0]?.id;
    if (studentTableData === "Error") {
        return NextResponse.json({ message: "Error Adding Student" }, { status: 500 });
    }

    // Add Student to Student Proxy Table
    const studentProxyData = await addStudentProxy(studentUUID, teacherUUID, class_id, classes_left, email);
    if (studentProxyData === "Error") {
        return NextResponse.json({ message: "Error Adding Student" }, { status: 500 });
    }

    // Send Welcome Email
    const welcomeEmailStatus = await sendWelcomeEmail(token, teacher_name, refresh_token, email);
    if (welcomeEmailStatus === "Email Failed") {
        return NextResponse.json({ message: "Error Sending Email" }, { status: 500 });
    }

    // Send Onboarding Email
    const onboardingEmailStatus = await sendOnboardingEmail(email, class_code, teacher_name, class_name);
    if (onboardingEmailStatus === "Email Failed") {
        return NextResponse.json({ message: "Error Sending Email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Student Added" }, { status: 200 });
}
