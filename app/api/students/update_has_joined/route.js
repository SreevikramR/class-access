// /api/students/update_has_joined
import { SupabaseClient } from "@supabase/supabase-js";
import verifyJWT from "@/components/util_function/verifyJWT";
import { NextResponse } from "next/server";
const supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Update student proxy
// PUT /api/students/update_proxy
// Request Header
//// jwt: JWT Token

export async function PUT(request) {
	const token = request.headers.get('jwt');
	const decodedJWT = verifyJWT(token);
	const studentUUID = decodedJWT?.sub;
	if (!decodedJWT) {
		return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
	}

	// Check if the user is a student
	const { data: studentData, error: studentError } = await supabase.from('students').select("proxy_ids").eq('id', studentUUID);
	if (studentError) {
		return NextResponse.json({ message: "Failed to get student data" }, { status: 500 });
	}
	if (studentData.length === 0) {
		return NextResponse.json({ message: "User is not a student" }, { status: 401 });
	}

	let studentProxyIDs = studentData[0].proxy_ids;
	let req = [];
	for (let i = 0; i < studentProxyIDs.length; i++) {
		req.push(supabase.from('student_proxies').update({
			hasJoined: true,
		}).eq('id', studentProxyIDs[i]));
	}
	const { data, error } = await Promise.all(req);

	if (error) {
		return NextResponse.json({ message: "Failed to update student proxy" }, { status: 500 });
	}
	return NextResponse.json({ message: "Student proxy updated" }, { status: 200 });
}
