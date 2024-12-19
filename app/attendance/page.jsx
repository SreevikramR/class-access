"use client";
import React, { useState } from "react";
import Header from "@/components/page_components/header";
import Footer from "@/components/page_components/footer";
import AuthWrapper from "@/components/page_components/authWrapper";
import { Sidebar } from "@/components/page_components/attendancePage/Sidebar";
import { Calendar } from "@/components/page_components/attendancePage/Calendar";

const Page = () => {
	const [selectedClass, setSelectedClass] = useState("");
	const [selectedStudent, setSelectedStudent] = useState("John Doe");
	const [attendanceData, setAttendanceData] = useState([]);

	return (
		<AuthWrapper>
			<div className="flex flex-col min-h-screen">
				<Header />
				<main className="flex-1 min-h-[80vh] bg-gray-100 p-10 pt-8">
					<div className="flex h-[80vh] gap-6 p-6">
						<Sidebar
							selectedClass={selectedClass}
							selectedStudent={selectedStudent}
							onClassChange={setSelectedClass}
							onStudentChange={setSelectedStudent}
						/>
						<main className="flex-1 bg-white rounded-lg shadow-sm p-6">
							<h1 className="text-xl font-semibold mb-6">
								Attendance for {selectedStudent}
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
