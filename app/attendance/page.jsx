"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/page_components/header";
import Footer from "@/components/page_components/footer";
import AuthWrapper from "@/components/page_components/authWrapper";
import { Sidebar } from "@/components/page_components/attendancePage/Sidebar";
import { Calendar } from "@/components/page_components/attendancePage/Calendar";
import { supabaseClient } from "@/components/util_function/supabaseCilent";

const Page = () => {
	const [selectedClassId, setSelectedClassId] = useState("");
	const [selectedStudent, setSelectedStudent] = useState(false);
	const [attendanceData, setAttendanceData] = useState([]);
	const [classSelectValue, setClassSelectValue] = useState("Select Class")
	const [classes, setClasses] = useState([])
	const [students, setStudents] = useState([])

	useEffect(() => {
		fetchClasses();
	}, []);

	useEffect(() => {
		console.log(attendanceData)
	}, [attendanceData])

	useEffect(() => {
		if (selectedClassId && selectedStudent) {
			fetchAttendanceRecords(selectedClassId, selectedStudent.id);
			// fetchPaymentRecords(selectedClassId, selectedStudent.id);
		}
	}, [selectedStudent, selectedClassId]);

	useEffect(() => {
		if (selectedClassId) {
			fetchStudents(selectedClassId);
		}
	}, [selectedClassId]);

	const fetchAttendanceRecords = async (classId, studentId) => {
		const {data, error} = await supabaseClient
			.from('attendance_records')
			.select('date, isPresent')
			.eq('class_id', classId)
			.eq('student_proxy_id', studentId);

		if (error) {
			console.error('Error fetching attendance records:', error);
			return;
		}

		const updatedDateData = data.map(record => {
			const date = new Date(record.date);
			// const dayOfWeek = date.toLocaleString('default', {weekday: 'short'});
			// const month = date.toLocaleString('default', {month: 'short'});
			// const day = date.getDate();
			// const year = date.getFullYear();
			// const formattedDate = `${dayOfWeek}, ${day} ${month} ${year}`;
			return {...record, date: date};
		});

		setAttendanceData(updatedDateData);
	};

	const fetchStudents = async (classId) => {
		const {data: classInfo, error: classError} = await supabaseClient
			.from('classes')
			.select('student_proxy_ids')
			.eq('id', classId)
			.single();
		if (classError) {
			console.error('Error fetching class data:', classError);
			return;
		}

		const studentIds = classInfo.student_proxy_ids;
		const {data: studentsData, error: studentsError} = await supabaseClient
			.from('student_proxies')
			.select('id, first_name, last_name, email, status')
			.in('id', studentIds);

		if (studentsError) {
			console.error('Error fetching students data:', studentsError);
			return;
		}
		const updatedStudents = studentsData.map(student => ({
			...student, first_name: student.first_name || student.email, last_name: student.last_name || ""
		}));
		setStudents(updatedStudents);
	};

	const fetchClasses = async () => {
		const {data, error} = await supabaseClient.from('classes').select('id, name');
		if (error) {
			console.error('Error fetching classes:', error);
			return;
		}
		setClasses(data);
	};

	return (
		<AuthWrapper>
			<div className="flex flex-col min-h-screen">
				<Header />
				<main className="flex-1 min-h-[80vh] bg-gray-100 p-10 pt-8">
					<div className="flex h-[80vh] gap-6 p-6">
						<Sidebar
							selectedClassId={selectedClassId}
							selectedStudent={selectedStudent}
							setSelectedClassId={setSelectedClassId}
							setSelectedStudent={setSelectedStudent}
							classSelectValue={classSelectValue}
							setClassSelectValue={setClassSelectValue}
							classes={classes}
							students={students}
						/>
						<main className="flex-1 bg-white rounded-lg shadow-sm p-6">
							<h1 className="text-xl font-semibold mb-6">
								Attendance for {selectedStudent.first_name} {selectedStudent.last_name}
							</h1>
							<div className="flex justify-center">
								<Calendar
									studentName={selectedStudent}
									attendanceData={attendanceData}
									setAttendanceData={setAttendanceData}
								/>
							</div>
						</main>
					</div>
				</main>
				<Footer />
			</div>
		</AuthWrapper>
	);
};

export default Page;
