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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {supabaseClient} from '@/components/util_function/supabaseCilent'
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF";

const months = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
]

const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const ViewAttendance = () => {
	const [classSelectValue, setClassSelectValue] = useState("Select Class")
	const [selectedClassId, setSelectedClassId] = useState(null)
	const [classes, setClasses] = useState([])
	const [selectedStudent, setSelectedStudent] = useState(null)
	const [attendanceRecords, setAttendanceRecords] = useState([])
	const [paymentRecords, setPaymentRecords] = useState([]);
	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(months[new Date().getMonth()]);
	const [teacherName, setTeacherName] = useState("")

	const generateReport = async () => {
		// Generate the PDF as a blob

		const studentName = selectedStudent.first_name + " " + selectedStudent.last_name
		const today = new Date()
		const dateString = today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear()
		const recordsInYear = attendanceRecords.filter(record => new Date(record.date).getFullYear() === year)
		const recordsInMonth = recordsInYear.filter(record => monthsShort[new Date(record.date).getMonth()] === month.substring(0, 3)).reverse()
		const formattedName = studentName.toLowerCase().replace(/\s+/g, "_");
		const newName = `${formattedName}_${month.toLowerCase()}_${year}`;

		const pdfBlob = await pdf(
			<InvoicePDF studentName={studentName} className={classSelectValue} invoiceDate={dateString} reportMonth={month} reportYear={year} teacherName={teacherName} attendanceRecords={recordsInMonth} fileName={newName} />,
		).toBlob();

		// Create a Blob URL for the PDF
		const url = URL.createObjectURL(pdfBlob);

		// Open the PDF in a new tab
		window.open(url, "_blank");

		// Clean up the Blob URL after use
		URL.revokeObjectURL(url);
	};

	async function fetchTeacherName() {
		try {
			const {data: {user}} = await supabaseClient.auth.getUser()
			if (user) {
				const {data, error} = await supabaseClient
					.from('teachers')
					.select('first_name, last_name')
					.eq('id', user.id)
					.single()

				if (error) throw error

				if (data) {
					setTeacherName(`${data.first_name} ${data.last_name}`)
				}
			}
		} catch (error) {
			console.error('Error fetching teacher name:', error)
		}
	}

	useEffect(() => {
		// Set previous month
		let prevMonth = new Date().getMonth() - 1;
		prevMonth = prevMonth < 0 ? 11 : prevMonth;
		setMonth(months[prevMonth])
		if (prevMonth == 11) {
			setYear(year - 1)
		}
		fetchTeacherName()
	}, []);

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

		// const updatedDateData = data.map(record => {
		// 	const date = new Date(record.date);
		// 	const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
		// 	const month = date.toLocaleString('default', { month: 'short' });
		// 	const day = date.getDate();
		// 	const year = date.getFullYear();
		// 	const formattedDate = `${dayOfWeek}, ${day} ${month} ${year}`;
		// 	return { ...record, date: formattedDate };
		// });

		setPaymentRecords(data);
	};

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

	return (<Card className="grid w-full min-h-[75vh] grid-cols-[300px_1fr] bg-background text-foreground">
		<div className="border-r bg-muted/40 p-4">
			<div className="mb-2 flex items-center justify-between">
				<h1 className="text-xl font-bold">Class</h1>
			</div>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-bold">Students</h1>
			</div>

		</div>
		<div className="p-4">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-bold"> Attendance History {selectedStudent && `: ${selectedStudent.first_name} ${selectedStudent.last_name}`}</h1>
				{selectedStudent && <Popover>
					<PopoverTrigger asChild>
						<Button className="bg-transparent border-2 border-black text-black hover:bg-zinc-200 font-medium">Export Report</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[280px] p-0" align="start">
						<div className="grid gap-4 p-4">
							<div className="grid gap-2">
								<Label htmlFor="year">Year</Label>
								<Input
									id="year"
									type="number"
									placeholder="YYYY"
									value={year}
									min={0}
									max={10000}
									onChange={(event) => setYear(event.value)}
									className="w-full"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="month">Month</Label>
								<Select value={month} onValueChange={setMonth}>
									<SelectTrigger id="month">
										<SelectValue placeholder="Select month" />
									</SelectTrigger>
									<SelectContent>
										<ScrollArea className="h-[200px]">
											{months.map((m) => (
												<SelectItem key={m} value={m}>
													{m}
												</SelectItem>
											))}
										</ScrollArea>
									</SelectContent>
								</Select>
							</div>
							<Button onClick={generateReport}>Generate Report</Button>
						</div>
					</PopoverContent>
				</Popover>}
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
