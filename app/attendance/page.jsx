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
	const [selectedStudent, setSelectedStudent] = useState("John Doe");
	const [attendanceData, setAttendanceData] = useState([]);
	const [classSelectValue, setClassSelectValue] = useState("Select Class")
	const [classes, setClasses] = useState([])

	useEffect(() => {
		fetchClasses();
	}, []);

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
