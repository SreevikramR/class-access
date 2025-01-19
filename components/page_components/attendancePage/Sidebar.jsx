import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandList, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, ChevronRightIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import InvoicePDF from "./InvoicePDF";
import { pdf } from "@react-pdf/renderer";
import { supabaseClient } from "@/components/util_function/supabaseCilent";
import { toast } from "@/components/ui/use-toast";
import fetchTimeout from "@/components/util_function/fetch";

const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

const monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

export function Sidebar({ selectedClassId, setSelectedClassId, selectedStudent, setSelectedStudent, classSelectValue, setClassSelectValue, classes, students }) {
	const [classSelectOpen, setClassSelectOpen] = useState(false);
	const buttonRef = useRef(null);
	const [popoverWidth, setPopoverWidth] = useState("auto");
	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(months[new Date().getMonth()]);
	const [teacherName, setTeacherName] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);

	async function fetchTeacherName() {
		try {
			const {
				data: { user },
			} = await supabaseClient.auth.getUser();
			if (user) {
				const { data, error } = await supabaseClient
					.from("teachers")
					.select("first_name, last_name")
					.eq("id", user.id)
					.single();

				if (error) throw error;

				if (data) {
					setTeacherName(`${data.first_name} ${data.last_name}`);
				}
			}
		} catch (error) {
			console.error("Error fetching teacher name:", error);
		}
	}

	useEffect(() => {
		// Set previous month
		let prevMonth = new Date().getMonth() - 1;
		prevMonth = prevMonth < 0 ? 11 : prevMonth;
		setMonth(months[prevMonth]);
		if (prevMonth == 11) {
			setYear(year - 1);
		}
		fetchTeacherName();
	}, []);

	const emailReport = async () => {
		// Generate the PDF as a blob
		if (isGenerating) return;
		setIsGenerating(true);
		const { data, error } = await supabaseClient
			.from("attendance_records")
			.select("date, isPresent")
			.eq("class_id", selectedClassId)
			.eq("student_proxy_id", selectedStudent.id);

		if (error) {
			console.error("Error fetching attendance records:", error);
			toast({
				variant: "destructive", title: "Error", description: "Error Exporting Attendance, Please try again later",
			})
			setIsGenerating(false);
			return;
		}

		(async () => {
			const updatedString = data.map((record) => {
				const date = new Date(record.date);
				const dayOfWeek = date.toLocaleString("default", {weekday: "short"});
				const month = date.toLocaleString("default", {month: "short"});
				const day = date.getDate();
				const year = date.getFullYear();
				const formattedDate = `${dayOfWeek}, ${day} ${month} ${year}`;
				return { ...record, date: formattedDate };
			});

			// After ensuring updatedString is ready
			const studentName = selectedStudent.first_name + " " + selectedStudent.last_name;
			const today = new Date();
			const dateString = today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();
			const recordsInYear = updatedString.filter((record) => new Date( record.year + "/" + (record.month + 1) + "/" + record.date).getFullYear() === year );
			const recordsInMonth = recordsInYear.filter((record) => monthsShort[new Date(record.date).getMonth()] === month.substring(0, 3));
			const formattedName = studentName.toLowerCase() .replace(/\s+/g, "_");
			const newName = `${formattedName}_${month.toLowerCase()}_${year}`;

			const pdfBlob = await pdf(
				<InvoicePDF
					studentName={studentName}
					className={classSelectValue}
					invoiceDate={dateString}
					reportMonth={month}
					reportYear={year}
					teacherName={teacherName}
					attendanceRecords={recordsInMonth}
					fileName={newName}
				/>,
			).toBlob();
			// Create a Blob URL for the PDF
			const url = URL.createObjectURL(pdfBlob);

			let reader = new FileReader();
			reader.readAsArrayBuffer(pdfBlob);
			reader.onloadend = async function () {
			    let buffer = reader.result;
			    let base64data = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));

				const teacherUUID = (await supabaseClient.auth.getUser()).data.user.id
				const { data: teacherData, error: teacherError } = await supabaseClient.from('teachers').select('email, first_name, last_name').eq('id', teacherUUID)
				const controller = new AbortController()
				const { signal } = controller;
				const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
				const email = students.find(s => s.id === selectedStudent.id).email
				const response = await fetchTimeout(`/api/emails/attendance_report`, 5000, {
					signal, method: 'POST', headers: {
						'Content-Type': 'application/json',
						'jwt': jwt,
						"email": email,
						"teacherName": `${teacherData[0].first_name} ${teacherData[0].last_name}`,
						"teacherEmail": teacherData[0].email,
						"fileName": `${newName}.pdf`,
						"className": classSelectValue,
					},
					body: JSON.stringify({ pdf: base64data })
				});
				if (response.status !== 200) {
					toast({
						variant: "destructive", title: "Error", description: "Error sending email. Please try again later.",
					})
				} else {
					toast({
						className: "bg-green-500 border-black border-2",
						title: "Attendance Report Emailed!",
						duration: 3000
					});
				}
				setIsGenerating(false);
			}
			// Open the PDF in a new tab
			umami.track("Attendance PDF Emailed")
			// Clean up the Blob URL after use
			URL.revokeObjectURL(url);
		})();
	};

	const generatePDF = async () => {
		// Generate the PDF as a blob
		if (isGenerating) return;
		setIsGenerating(true);
		const { data, error } = await supabaseClient
			.from("attendance_records")
			.select("date, isPresent")
			.eq("class_id", selectedClassId)
			.eq("student_proxy_id", selectedStudent.id);

		if (error) {
			console.error("Error fetching attendance records:", error);
			toast({
				variant: "destructive", title: "Error", description: "Error Exporting Attendance, Please try again later",
			})
			setIsGenerating(false);
			return;
		}

		(async () => {
			const updatedString = data.map((record) => {
				const date = new Date(record.date);
				const dayOfWeek = date.toLocaleString("default", {weekday: "short"});
				const month = date.toLocaleString("default", {month: "short"});
				const day = date.getDate() + 1;
				const year = date.getFullYear();
				const formattedDate = `${dayOfWeek}, ${day} ${month} ${year}`;
				return { ...record, date: formattedDate };
			});

			// After ensuring updatedString is ready
			const studentName = selectedStudent.first_name + " " + selectedStudent.last_name;
			const today = new Date();
			const dateString = today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();
			const recordsInYear = updatedString.filter((record) => new Date(record.date).getFullYear() == year );
			const recordsInMonth = recordsInYear.filter((record) => monthsShort[new Date(record.date).getMonth()] === month.substring(0, 3));
			const formattedName = studentName.toLowerCase() .replace(/\s+/g, "_");
			const newName = `${formattedName}_${month.toLowerCase()}_${year}`;

			const pdfBlob = await pdf(
				<InvoicePDF
					studentName={studentName}
					className={classSelectValue}
					invoiceDate={dateString}
					reportMonth={month}
					reportYear={year}
					teacherName={teacherName}
					attendanceRecords={recordsInMonth}
					fileName={newName}
				/>,
			).toBlob();
			const url = URL.createObjectURL(pdfBlob);
			umami.track("Attendance PDF Exported")
			setIsGenerating(false);
			window.open(url, "_blank");
			URL.revokeObjectURL(url);
		})();
	};

	const handleClassSelect = (classId, className) => {
		setClassSelectValue(className);
		setSelectedClassId(classId);
		setSelectedStudent(false);
		setClassSelectOpen(false);
	};

	const handleStudentSelect = (student) => {
		setSelectedStudent(student);
	};

	useEffect(() => {
		if (buttonRef.current) {
			setPopoverWidth(`${buttonRef.current.offsetWidth}px`);
		}
	}, []);

	function ClassSelectionCombobox() {
		return (
			<Popover
				open={classSelectOpen}
				onOpenChange={setClassSelectOpen}
				className="w-full"
			>
				<PopoverTrigger asChild>
					<Button
						ref={buttonRef}
						variant={"outline"}
						className="w-full justify-start text-left font-normal mb-6"
					>
						<ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
						{classSelectValue}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="p-0" style={{ width: popoverWidth }}>
					<Command>
						<CommandInput placeholder="Search Class..." />
						<CommandEmpty>No Class found.</CommandEmpty>
						<CommandGroup>
							<CommandList>
								{classes.map((classItem) => (
									<CommandItem
										key={classItem.id}
										value={classItem.id}
										onSelect={() => handleClassSelect(classItem.id,classItem.name)}
									>
										<Check className={ "mr-2 h-4 w-4" + (classSelectValue === classItem.id ? " opacity-100" : " opacity-0") }/>
										{classItem.name}
									</CommandItem>
								))}
							</CommandList>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		);
	}

	function StudentList() {
		return (
			<div className="flex-1 overflow-auto">
				<div className="space-y-2">
					{students.map((student) => (
						<div
							key={student.id}
							onClick={() => handleStudentSelect(student)}
							className={`flex items-center justify-between border-[1px] border-zinc-400 hover:bg-zinc-200 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${selectedStudent && selectedStudent.id === student.id ? "bg-accent text-accent-foreground" : "bg-muted"}`}
						>
							<div className="flex items-center gap-3">
								<Avatar className="h-8 w-8 border">
									<AvatarFallback>
										{student.first_name.charAt(0)}
										{student.last_name.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									{student.first_name === "Student" && student.last_name === "Invited" ? student.email : `${student.first_name} ${student.last_name}`}
								</div>
							</div>
							<ChevronRightIcon className="h-4 w-4" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<aside className="w-[30vw] bg-white rounded-lg shadow-sm p-6 space-y-6 flex flex-col justify-between">
			<div>
				<div className="space-y-2">
					<ClassSelectionCombobox />
				</div>

				<div className="space-y-2">
					<h2 className="text-lg font-semibold">Students</h2>
					<StudentList />
				</div>
			</div>

			<div className="pt-4 mt-auto">
				{selectedStudent && (
					<Popover>
						<PopoverTrigger asChild>
							<Button className="w-full" variant="default">
								<Download className="w-4 h-4 mr-2" />
								Export Attendance
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[300px] p-0" align="start">
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
										onChange={(event) =>
											setYear(event.target.value)
										}
										className="w-full"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="month">Month</Label>
									<Select
										value={month}
										onValueChange={setMonth}
									>
										<SelectTrigger id="month">
											<SelectValue placeholder="Select month" />
										</SelectTrigger>
										<SelectContent>
											<ScrollArea className="h-[200px]">
												{months.map((m) => (
													<SelectItem
														key={m}
														value={m}
													>
														{m}
													</SelectItem>
												))}
											</ScrollArea>
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2">
									<Button onClick={generatePDF} className={"border-2 bg-white hover:bg-gray-200 border-black text-black" + (isGenerating ? " cursor-progress" : "")}>
										Download PDF
									</Button>
									<Button onClick={emailReport} className={"border-2 border-black hover:bg-gray-600" + (isGenerating ? " cursor-progress" : "")}>
										Email to Student
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				)}
			</div>
		</aside>
	);
}
