"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function Calendar({ studentName, attendanceData, setAttendanceData }) {
	const [currentMonth, setCurrentMonth] = useState(11); // December
	const [currentYear, setCurrentYear] = useState(2024);

	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
	const monthName = new Date(currentYear, currentMonth).toLocaleString(
		"default",
		{
			month: "long",
		},
	);

	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const previousMonthDays = Array.from(
		{ length: firstDayOfMonth },
		(_, i) => i + 1,
	);


	const getAttendanceStatus = (day) => {
		const record = attendanceData.find((record) => record.date === day && record.month === currentMonth && record.year === currentYear );
		return record ? record.status : "not-marked";
	};

	const getStatusColor = (status) => {
		switch (status) {
		case "present":
			return "bg-green-300 hover:bg-green-500";
		case "absent":
			return "bg-red-300 hover:bg-red-500";
		default:
			return "bg-white hover:bg-zinc-200";
		}
	};

	const handleDayClick = (day) => {
		const newStatus = (getAttendanceStatus(day) === "present") ? "absent" : (getAttendanceStatus(day) === "absent")? "not-marked" : "present";
		console.log(day)

		setAttendanceData(prevData => {
			const existingRecordIndex = prevData.findIndex(record => record.date === day  && record.month === currentMonth && record.year === currentYear);

			if (existingRecordIndex !== -1) {
				// Update existing record
				const updatedData = [...prevData];
				if (newStatus == "not-marked") {
					// remove record
					return updatedData.filter((_, index) => index !== existingRecordIndex);
				} else {
					updatedData[existingRecordIndex] = {date: day, month: currentMonth, year: currentYear, status: newStatus}
					return updatedData;
				}
			} else {
				// Add new record
				return [...prevData, { date: day, month: currentMonth, year: currentYear, status: newStatus }];
			}
		});
	};


	return (
		<div className="w-full max-w-3xl border-2 border-black">
			<div className="flex items-center justify-between mb-4">
				<button
					onClick={() => {
						if (currentMonth === 0) {
							setCurrentMonth(11);
							setCurrentYear(currentYear - 1);
						} else {
							setCurrentMonth(currentMonth - 1);
						}
					}}
					className="p-2 hover:bg-zinc-200 rounded-full"
				>
					<ChevronLeft className="w-5 h-5" />
				</button>
				<h2 className="text-lg font-medium">
					{monthName} {currentYear}
				</h2>
				<button
					onClick={() => {
						if (currentMonth === 11) {
							setCurrentMonth(0);
							setCurrentYear(currentYear + 1);
						} else {
							setCurrentMonth(currentMonth + 1);
						}
					}}
					className="p-2 hover:bg-zinc-200 rounded-full"
				>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>

			<div className="grid grid-cols-7 gap-2 bg-white rounded-lgs overflow-hidden">
				{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
					<div
						key={day}
						className="bg-white p-4 text-center text-sm font-medium"
					>
						{day}
					</div>
				))}

				{previousMonthDays.map((_, index) => (
					<div key={`prev-${index}`} className="bg-white p-4" />
				))}

				{days.map((day) => {
					const status = getAttendanceStatus(day);
					return (
						<div
							key={day}
							onClick={handleDayClick.bind(null, day)}
							className={`p-4 text-center rounded-lg relative cursor-pointer ${getStatusColor(status)}`}
						>
							{day}
						</div>
					);
				})}
			</div>

			<div className="flex gap-6 my-6 justify-center">
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 bg-green-300 rounded" />
					<span className="text-sm">Present</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 bg-red-300 rounded" />
					<span className="text-sm">Absent</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 border border-gray-200 rounded" />
					<span className="text-sm">Not Marked</span>
				</div>
			</div>
		</div>
	);
}
