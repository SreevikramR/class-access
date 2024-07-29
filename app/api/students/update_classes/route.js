// /api/students/update_proxy
import verifyJWT from "@/components/util_function/verifyJWT";
import { createClient } from "@supabase/supabase-js";
import {NextResponse} from "next/server";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// PUT Endpoint
// Endpoint can update the classes_left of a student proxy
// Headers needed for this endpoint:
//// jwt: JWT Token
//// student_proxy_id: Student Proxy ID
//// class_id: Class ID
//// classes_left: Classes Left

export async function PUT(request) {
    const token = request.headers.get("jwt");
    const decodedJWT = verifyJWT(token);
    const teacherUUID = decodedJWT?.sub;
    if (!decodedJWT) {
        return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
    }

    const { data: teacherData, error: teacherError } = await supabase.from("teachers").select().eq("id", teacherUUID);
    if (teacherError) {
        console.log("Error Fetching Teacher Data: 'teachers' Table");
        console.log(teacherError);
        return NextResponse.json({ message: "Error Adding Student" }, { status: 500 });
    }
    if (teacherData.length === 0) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const proxy_id = request.headers.get("student_proxy_id");
    const class_id = request.headers.get("class_id");
    const classes_left = request.headers.get("classes_left");

    const { data: studentProxyData, error: studentProxyError } = await supabase.from("student_proxies").select().eq("id", proxy_id);
    if (studentProxyError) {
        console.log("Error Fetching Student Proxy Data: 'student_proxies' Table");
        console.log(studentProxyError);
        return NextResponse.json({ message: "Error Adding Student" }, { status: 500 });
    }
    if (studentProxyData.length === 0) {
        return NextResponse.json({ message: "Student Proxy Not Found" }, { status: 401 });
    }

    let classes_left_jb = studentProxyData[0].classes_left;
    classes_left_jb[class_id] = classes_left;
    const { data, error } = await supabase.from("student_proxies").update({ classes_left: classes_left_jb }).eq("id", proxy_id).select();
    if (error) {
        console.log("Error Updating Student Data: 'student_proxies' Table");
        console.log(error);
        return NextResponse.json({ message: "Error Adding Student" }, { status: 500 });
    }

    return NextResponse.json({ message: "Updated Classes Left" }, { status: 200 });
}