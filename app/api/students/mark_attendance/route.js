import verifyJWT from "@/components/util_function/verifyJWT";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// PUT Endpoint
// Endpoint can update the classes_left of a student proxy
// Headers needed for this endpoint:
//// jwt: JWT Token
//// attendance: JSON object containing the attendance data. Example {"student_proxy_id": true}
//// date: Date of the attendance record
//// class_id: ID of the class


export async function POST(request) {

	const token = request.headers.get("jwt");
	const decodedJWT = verifyJWT(token);
	const teacherUUID = decodedJWT?.sub;
	if (!decodedJWT) {
		return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
	}

	let date = new Date(request.headers.get("attendance_date"));
	const attendanceData = JSON.parse(request.headers.get("attendance"));
	const classId = request.headers.get("class_id");

	const students = Object.keys(attendanceData);
	const { data: studentProxies, error: studentProxiesError } = await supabase
		.from("student_proxies")
		.select("id, classes_left, teacher_id")
		.in("id", students);
	if (studentProxiesError) {
		return NextResponse.json({ message: "Error fetching student proxies" }, { status: 500 });
	}
	for (const student of studentProxies) {
		if (student.teacher_id !== teacherUUID) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
		}
	}

	const classesLeftChange = {}

	async function processAttendanceForStudent(studentId) {
		const { data: existingRecord, error: fetchError } = await supabase
			.from("attendance_records")
			.select("*")
			.eq("class_id", classId)
			.eq("date", date.toDateString())
			.eq("student_proxy_id", studentId)
		if (fetchError) {
			throw new Error("Error fetching attendance record");
		}

		if (existingRecord.length > 0) {
			// Update existing record
			if (existingRecord[0].isPresent === attendanceData[studentId]) {
				classesLeftChange[studentId] = 0;
				return;
			} else if (attendanceData[studentId]) {
				classesLeftChange[studentId] = -1;
			} else {
				classesLeftChange[studentId] = 1;
			}
			const { error: updateError } = await supabase
				.from("attendance_records")
				.update({ isPresent: attendanceData[studentId] })
				.eq("id", existingRecord[0].id);

			if (updateError) {
				throw new Error("Error updating attendance record");
			}
		} else {
			// Insert new record
			const { error: insertError } = await supabase
				.from("attendance_records")
				.insert([
					{ class_id: classId, date: date.toDateString(), student_proxy_id: studentId, isPresent: attendanceData[studentId] }
				]);
			if (attendanceData[studentId]) {
				classesLeftChange[studentId] = -1;
			} else {
				classesLeftChange[studentId] = 0;
			}
			if (insertError) {
				throw new Error("Error inserting new attendance record");
			}
		}
	}

	const result = await Promise.all(students.map(studentId => processAttendanceForStudent(studentId)))
		.catch(error => {
			return NextResponse.json({ message: error.message }, { status: 500 });
		});

	const updatePromises = studentProxies.map(student => {
		const classesLeftNumber = parseInt(student.classes_left[classId]) + classesLeftChange[student.id];
		const classesLeft = { ...student.classes_left, [classId]: classesLeftNumber.toString() };
		return supabase
			.from("student_proxies")
			.update({ classes_left: classesLeft })
			.eq("id", student.id);
	});

	try {
		const results = await Promise.all(updatePromises);
		const errors = results.filter(result => result.error);
		if (errors.length > 0) {
			return NextResponse.json({ message: "Error updating student proxies" }, { status: 500 });
		}
	} catch (error) {
		return NextResponse.json({ message: "Error updating student proxies" }, { status: 500 });
	}

	// Return success response
	return NextResponse.json({ message: "Attendance record updated successfully" }, { status: 200 });
}
