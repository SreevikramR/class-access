"use client";
import React, {useEffect, useState} from 'react'
import {Button} from "@/components/ui/button"
import {Check, ChevronsUpDown} from 'lucide-react'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {Card} from '@/components/ui/card'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command'
import {supabaseClient} from '@/components/util_function/supabaseCilent'

const ViewAttendance = () => {
	const [classSelectOpen, setClassSelectOpen] = useState(false)
	const [classSelectValue, setClassSelectValue] = useState("Select Class")
	const [selectedClassId, setSelectedClassId] = useState(null)
	const [classes, setClasses] = useState([])
	const [students, setStudents] = useState([])
	const [selectedStudent, setSelectedStudent] = useState(null)
	const [attendanceRecords, setAttendanceRecords] = useState([])
	const [paymentRecords, setPaymentRecords] = useState([]);

	useEffect(() => {
		fetchClasses();
	}, []);

	useEffect(() => {
		if (selectedClassId) {
			fetchStudents(selectedClassId);
		}
	}, [selectedClassId]);

	useEffect(() => {
		if (selectedClassId && selectedStudent) {
			fetchAttendanceRecords(selectedClassId, selectedStudent.id);
		}
	}, [selectedStudent]);

	const fetchClasses = async () => {
		const {data, error} = await supabaseClient.from('classes').select('id, name');
		if (error) {
			console.error('Error fetching classes:', error);
			return;
		}
		setClasses(data);
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
	const fetchPaymentRecords = async (classId, studentId) => {
		const {data, error} = await supabaseClient
			.from('payments')
			.select('date, amount, notes')
			.eq('class_id', classId)
			.eq('student_proxy_id', studentId);

		if (error) {
			console.error('Error fetching payment records:', error);
			return;
		}

		setPaymentRecords(data);
	};
	useEffect(() => {
		if (selectedClassId && selectedStudent) {
			fetchAttendanceRecords(selectedClassId, selectedStudent.id);
			fetchPaymentRecords(selectedClassId, selectedStudent.id);
		}
	}, [selectedStudent]);

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

		const {data: studentData, error: studentError} = await supabaseClient
			.from('student_proxies')
			.select('classes_left')
			.eq('id', studentId)
			.single();

		if (studentError) {
			console.error('Error fetching student data:', studentError);
			return;
		}

		const classesLeft = studentData.classes_left[classId];

		const updatedRecords = data.map(record => ({
			...record, classes_left: classesLeft
		}));

		setAttendanceRecords(updatedRecords);
	};

	const handleClassSelect = (classId, className) => {
		setClassSelectValue(className);
		setSelectedClassId(classId);
		setSelectedStudent(false)
		setClassSelectOpen(false);
	};


	const handleStudentSelect = (student) => {
		setSelectedStudent(student);
	};

	function ClassSelectionCombobox() {
		return (<PopoverContent className="w-[250px] p-0">
			<Command>
				<CommandInput placeholder="Search Class..."/>
				<CommandEmpty>No Class found.</CommandEmpty>
				<CommandGroup>
					<CommandList>
						{classes.map((classItem) => (<CommandItem
							key={classItem.id}
							value={classItem.id}
							onSelect={() => handleClassSelect(classItem.id, classItem.name)}
						>
							<Check
								className={"mr-2 h-4 w-4" + (classSelectValue === classItem.id ? " opacity-100" : " opacity-0")}/>
							{classItem.name}
						</CommandItem>))}
					</CommandList>
				</CommandGroup>
			</Command>
		</PopoverContent>)
	}

	const _paymentRecordRow = ({date, amount, notes}) => {
		return (<TableRow className="bg-green-300 hover:bg-green-200">
			<TableCell>{date}</TableCell>
			<TableCell>${amount}</TableCell>
			<TableCell className="justify-center">
				<span className="text-center">{notes}</span>
			</TableCell> </TableRow>);
	};
	const combinedRecords = [...attendanceRecords.map(record => ({
		...record, type: 'attendance'
	})), ...paymentRecords.map(record => ({
		...record, type: 'payment'
	}))].sort((a, b) => new Date(b.date) - new Date(a.date));

	return (<Card className="grid w-full min-h-screen grid-cols-[300px_1fr] bg-background text-foreground">
		<div className="border-r bg-muted/40 p-4">
			<div className="mb-2 flex items-center justify-between">
				<h1 className="text-xl font-bold">Class</h1>
			</div>
			<Popover open={classSelectOpen} onOpenChange={setClassSelectOpen}>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className="w-[250px] mr-2 justify-start text-left font-normal mb-6">
						<ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50"/>
						{classSelectValue}
					</Button>
				</PopoverTrigger>
				<ClassSelectionCombobox/>
			</Popover>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-bold">Students</h1>
			</div>
			<div className="flex-1 overflow-auto">
				<div className="space-y-2">
					{students.map((student) => (<div
						key={student.id}
						onClick={() => handleStudentSelect(student)}
						className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${selectedStudent && selectedStudent.id === student.id ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}
					>
						<div className="flex items-center gap-3">
							<Avatar className="h-8 w-8 border">
								<AvatarImage src="/placeholder-user.jpg"/>
								<AvatarFallback>{student.first_name.charAt(0)}{student.last_name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
								{student.first_name === "Student" && student.last_name === "Invited" ? student.email : `${student.first_name} ${student.last_name}`}
							</div>
						</div>
						<ChevronRightIcon className="h-4 w-4"/>
					</div>))}
				</div>
			</div>
		</div>
		<div className="p-4">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-bold"> Attendance History
					{selectedStudent && `: ${selectedStudent.first_name} ${selectedStudent.last_name}`}</h1>
			</div>
			{selectedStudent ? (<>
				<div className="overflow-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Payment Amount</TableHead>
								<TableHead>Status / Notes</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{combinedRecords.map((record) => (record.type === 'attendance' ? (
								<TableRow key={record.date}>
									<TableCell>{record.date}</TableCell>
									<TableCell></TableCell>
									<TableCell>
										<Badge
											variant={record.isPresent ? "secondary" : "outline"}
										>
											{record.isPresent ? "Present" : "Absent"}
										</Badge>
									</TableCell>
								</TableRow>) : (<_paymentRecordRow
								key={record.date}
								date={record.date}
								amount={record.amount}
								notes={record.notes}
							/>)))}
						</TableBody>
					</Table>
				</div>
			</>) : (<p className="text-center text-gray-500 mt-8">Please select a student to view attendance
				records.</p>)}
		</div>
	</Card>)
}

function ChevronRightIcon(props) {
	return (<svg
		{...props}
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="m9 18 6-6-6-6"/>
	</svg>)
}

export default ViewAttendance
