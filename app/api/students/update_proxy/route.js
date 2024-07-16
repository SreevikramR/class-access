// /api/students/update_proxy

import { SupabaseClient } from "@supabase/supabase-js";
import verifyJWT from "@/components/util_function/verifyJWT";
import { NextResponse } from "next/server";
const supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Update student proxy
// PUT /api/students/update_proxy
// Request Header
//// jwt: JWT Token
//// first_name: First Name
//// last_name: Last Name
//// phone: Phone
//// student_proxy_id: Student Proxy ID
//// class_id: Class ID
//// class_status: Class Status (Invited/Joined)

export async function PUT(request) {
    const token = request.headers.get('jwt');
    const decodedJWT = verifyJWT(token);
    const studentUUID = decodedJWT?.sub;
    if (!decodedJWT) {
        return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    // Check if the user is a student
    const { data: studentData, error: studentError } = await supabase.from('students').select().eq('id', studentUUID);
    if (studentError) {
        return NextResponse.json({ message: "Failed to get student data" }, { status: 500 });
    }
    if (studentData.length === 0) {
        return NextResponse.json({ message: "User is not a student" }, { status: 401 });
    }

    const firstName = request.headers.get('first_name');
    const lastName = request.headers.get('last_name');
    const phone = request.headers.get('phone');
    const studentProxyID = request.headers.get('student_proxy_id');
    const classID = request.headers.get('class_id');
    const classStatus = request.headers.get('class_status');

    const { data: studentProxyData, error: studentProxyError } = await supabase.from('student_proxies').select().eq('id', studentProxyID);
    if (studentProxyError) {
        return NextResponse.json({ message: "Failed to get student proxy data" }, { status: 500 });
    }
    if (studentProxyData.length === 0) {
        return NextResponse.json({ message: "Student proxy not found" }, { status: 404 });
    }

    let class_status_jb = studentProxyData[0].status;
    if (studentProxyData[0].status[classID] != classStatus) {
        class_status_jb[classID] = classStatus;
    }

    const { data, error } = await supabase.from('student_proxies').update({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        hasJoined: true,
        status: class_status_jb
    }).eq('id', studentProxyID);

    if (error) {
        return NextResponse.json({ message: "Failed to update student proxy" }, { status: 500 });
    }
    return NextResponse.json({ message: "Student proxy updated" }, { status: 200 });
}