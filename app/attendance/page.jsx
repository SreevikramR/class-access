"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/page_components/header";
import Footer from "@/components/page_components/footer";
import AuthWrapper from "@/components/page_components/authWrapper";
import { Sidebar } from "@/components/page_components/attendancePage/Sidebar";
import { Calendar } from "@/components/page_components/attendancePage/Calendar";
import { supabaseClient } from "@/components/util_function/supabaseCilent";
import MarkAttendance from "@/components/page_components/attendancePage/MarkAttendance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CircleCheckBig, ClipboardList } from "lucide-react";
import { CircleUserRound, Users } from "lucide-react";

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
			.select('date, isPresent, id')
			.eq('class_id', classId)
			.eq('student_proxy_id', studentId);

		if (error) {
			console.error('Error fetching attendance records:', error);
			return;
		}

		const updatedDateData = data.map(record => {
			const date = new Date(record.date);
			const dateNumber = date.getDate();
			const month = date.getMonth();
			const year = date.getFullYear();
			const isPresent = record.isPresent ? 'present' : 'absent';
			return {id: record.id, date: dateNumber, month: month, year: year, status: isPresent};
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
				<main className="flex-1 bg-gray-100 p-10 pt-8">
					<Tabs defaultValue="group">
						<TabsList>
							<TabsTrigger value="individual" className="">Individual<CircleUserRound className='ml-2 w-4 h-4' /></TabsTrigger>
							<TabsTrigger value="group" className="ml-4">Group/Batch<Users className='ml-2 w-4 h-4'/></TabsTrigger>
						</TabsList>
						<TabsContent value="group" className="w-full max-h-[50vh] p-1 pt-2">
							<MarkAttendance />
						</TabsContent>
						<TabsContent value="individual" className="p-1 pt-2">
							<div className="h-[75vh] flex flex-row gap-6 w-full">
								<Sidebar
									selectedClassId={selectedClassId}
									selectedStudent={selectedStudent}
									setSelectedClassId={setSelectedClassId}
									setSelectedStudent={setSelectedStudent}
									classSelectValue={classSelectValue}
									setClassSelectValue={setClassSelectValue}
									classes={classes}
									students={students}
									attendanceRecords={attendanceData}
								/>
								<div className="flex-1 bg-white rounded-lg shadow-sm p-6">
									<h1 className="text-xl font-semibold mb-6">
										Attendance for {selectedStudent.first_name} {selectedStudent.last_name}
									</h1>
									<div className="flex justify-center">
										<Calendar
											studentName={selectedStudent}
											attendanceData={attendanceData}
											setAttendanceData={setAttendanceData}
											classId={selectedClassId}
											studentId={selectedStudent.id}
										/>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</main>
				<Footer />
			</div>
		</AuthWrapper>
	);
};

export default Page;
