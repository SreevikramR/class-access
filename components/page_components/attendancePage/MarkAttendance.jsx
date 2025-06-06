"use client"
import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "@/components/ui/use-toast";
import fetchTimeout from '@/components/util_function/fetch';

const MarkAttendance = () => {
	const [date, setDate] = useState(new Date());
	const [classSelectOpen, setClassSelectOpen] = useState(false);
	const [classSelectValue, setClassSelectValue] = useState("Select Class");
	const [classes, setClasses] = useState([]);
	const [students, setStudents] = useState([]);
	const [selectedClassId, setSelectedClassId] = useState(null);
	const [isFetchingStudents, setIsFetchingStudents] = useState(false);
	const [studentDataLoaded, setStudentDataLoaded] = useState(false);
	const [attendance, setAttendance] = useState({}); // Track attendance state
	const [isSavingAttendance, setIsSavingAttendance] = useState(false);

	useEffect(() => {
		fetchClasses();
	}, []);

	useEffect(() => {
		if (selectedClassId && date) {
			fetchStudentsAndSetAttendance(selectedClassId, date);
		}
	}, [selectedClassId, date]);

	const fetchClasses = async () => {
		const { data, error } = await supabaseClient
			.from('classes')
			.select('id, name');

		if (error) {
			console.error('Error fetching classes:', error);
			return;
		}

		setClasses(data);
	};

	const fetchStudentsAndSetAttendance = async (classId, selectedDate) => {
		if (isFetchingStudents) return;
		setIsFetchingStudents(true);

		const { data: classInfo, error: classError } = await supabaseClient
			.from('classes')
			.select('student_proxy_ids')
			.eq('id', classId)
			.single();
		if (classError) {
			console.error('Error fetching class data:', classError);
			setIsFetchingStudents(false);
			return;
		}

		const fetchStudentProxies = async () => {
			const studentIds = classInfo.student_proxy_ids;
			const { data: studentsData, error: studentsError } = await supabaseClient
				.from('student_proxies')
				.select('id, first_name, last_name, email, status, classes_left')
				.in('id', studentIds);
			if (studentsError) {
				console.error('Error fetching students data:', studentsError);
				setIsFetchingStudents(false);
				return;
			}
			setStudents(studentsData);
			setStudentDataLoaded(true);
			setIsFetchingStudents(false);
			return studentsData;
		}

		const fetchAttendanceRecords = async () => {
			const { data, error } = await supabaseClient
				.from('attendance_records')
				.select('student_proxy_id, isPresent')
				.eq('class_id', classId)
				.eq('date', format(selectedDate, "yyyy-MM-dd"));

			if (error) {
				console.error('Error fetching attendance data:', error);
				return {};
			}
			return data.reduce((acc, record) => {
				acc[record.student_proxy_id] = record.isPresent;
				return acc;
			}, {});
		}

		Promise.all([fetchStudentProxies(), fetchAttendanceRecords()]).then(([studentsData, attendanceData]) => {
			setAttendance(attendanceData);
		});
	}

	const handleClassSelect = (classId, className) => {
		setClassSelectValue(className);
		setSelectedClassId(classId);
		setClassSelectOpen(false);
	};

	const handleAttendanceChange = (studentId, isPresent, isAbsent) => {
		let newAttendanceList = { ...attendance };
		if(attendance[studentId] !== 'undefined' && !isPresent && !isAbsent) newAttendanceList[studentId] = null
		if (isPresent) {
			newAttendanceList[studentId] = true;
		} else if (isAbsent) {
			newAttendanceList[studentId] = false;
		}
		setAttendance(newAttendanceList);
		console.log(attendance);
	};

	const saveAttendance = async () => {
		// Save attendance records through API call to /api/students/mark_attendance
		if (isSavingAttendance) return;
		setIsSavingAttendance(true);
		const url = `${window.location.origin}/api/students/mark_attendance`;
		const signal = new AbortController().signal;
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
		const response = await fetchTimeout(url, 5500, { signal, method: 'POST', headers: { 'jwt': jwt, 'attendance': JSON.stringify(attendance), 'attendance_date': date, 'class_id': selectedClassId } });

		if (response.status === 200) {
			fetchStudentsAndSetAttendance(selectedClassId, date)
			toast({
				title: 'Attendance saved successfully.', className: 'bg-green-500 border-black border-2', duration: 3000
			});
		} else {
			toast({ title: 'Failed to save attendance.', variant: 'destructive', duration: 3000 });
		}
		setIsSavingAttendance(false);
	};

	function ClassSelectionCombobox() {
		return (<PopoverContent className="w-[250px] p-0">
			<Command>
				<CommandInput placeholder="Search Class..." />
				<CommandEmpty>No Class found.</CommandEmpty>
				<CommandGroup>
					<CommandList>
						{classes.map((classItem) => (<CommandItem
							key={classItem.id}
							value={classItem.id}
							onSelect={() => handleClassSelect(classItem.id, classItem.name)}
						>
							<Check
								className={"mr-2 h-4 w-4" + (classSelectValue === classItem.id ? " opacity-100" : " opacity-0")} />
							{classItem.name}
						</CommandItem>))}
					</CommandList>
				</CommandGroup>
			</Command>
		</PopoverContent>);
	}

	const UserRow = ({ id, first_name, last_name, email, classes_left }) => {
		let studentFirstName = first_name;
		let studentLastName = last_name;
		let studentEmail = email;

		if (studentFirstName == null) {
			studentFirstName = "Student";
			studentLastName = "Invited";
		}

		let classesNumber = classes_left[selectedClassId];
		let classesLeftElement;
		if (classesNumber == 0) {
			classesLeftElement = <span className="text-red-500 font-semibold">0</span>;
		} else {
			classesLeftElement = <span>{classesNumber}</span>
		}

		let isAbsent = false;
		if(!attendance[id] && attendance[id] != null) isAbsent = true
		if (attendance[id]) isAbsent = false

		return (
			<TableRow className="cursor-pointer">
				<TableCell>
					<div className="flex items-center gap-2">
						<div>{studentFirstName} {studentLastName}</div>
					</div>
				</TableCell>
				<TableCell>{studentEmail}</TableCell>
				<TableCell>{classesLeftElement}</TableCell>
				<TableCell className="text-center">
					<Checkbox
						checked={attendance[id] || false}
						onCheckedChange={(checked) => handleAttendanceChange(id, checked, false)}
					/> </TableCell>
				<TableCell className="text-center">
					<Checkbox
						checked={isAbsent}
						onCheckedChange={(checked) => handleAttendanceChange(id, false, checked)}
					/> </TableCell>
			</TableRow>
		);
	};

	return (<>
		<Popover open={classSelectOpen} onOpenChange={setClassSelectOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className="w-[250px] mr-2 justify-start text-left font-normal ">
					<ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
					{classSelectValue}
				</Button>
			</PopoverTrigger>
			<ClassSelectionCombobox />
		</Popover>
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={"w-[280px] ml-2 justify-start text-left font-normal " + (!date && " text-muted-foreground")}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[auto] p-0">
				<Calendar
					mode="single"
					selected={date}
					onSelect={setDate}
				/>
			</PopoverContent>
		</Popover>
		<Card className="mt-4">
			{students.length > 0 ? (
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Student</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Classes Left</TableHead>
								<TableHead className="text-center">Present</TableHead>
								<TableHead className="text-center">Absent</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{studentDataLoaded && students.map((student) => (<UserRow key={student.id} {...student} />))}
						</TableBody>
					</Table>
				</CardContent>
			) : (isFetchingStudents ? (<CardContent className="p-8 pt-0 text-gray-500">Loading Student Information...</CardContent>) :
				(<CardContent className="p-8 text-gray-500">Please add students to your class to view them here</CardContent>))}
		</Card>
		<div className='flex ml-auto justify-end'>
			<Button className={"mt-4" + (isSavingAttendance ? " cursor-progress" : "")} onClick={saveAttendance}>Save Attendance</Button>
		</div>
	</>);
};

export default MarkAttendance;
