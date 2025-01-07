import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabaseClient } from '@/components/util_function/supabaseCilent'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import fetchTimeout from '@/components/util_function/fetch'
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
const downloadDialogAsPDF = async ({ selectedInvoice, toast, dialogElementId }) => {
  if (!selectedInvoice) {
      toast({
          variant: "destructive",
          title: "Error",
          description: "No invoice selected to download.",
      });
      return;
  }

  try {
      const pdf = new jsPDF();

      // Header: Company Name and Logo
      pdf.setFontSize(16);
      pdf.setTextColor(40);
      pdf.text("Class Access", 10, 20);
      pdf.setFontSize(10);
      pdf.text("Powered by Class Access", 10, 25);

      // Divider
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      pdf.line(10, 30, 200, 30);

      // Invoice Title and Metadata
      pdf.setFontSize(12);
      pdf.text("Invoice Receipt", 10, 40);
      pdf.text(`Invoice ID: ${selectedInvoice.id || "N/A"}`, 10, 50);
      pdf.text(`Date: ${selectedInvoice.invoiceDisplayDate || "N/A"}`, 10, 60);

      // Student Information
      pdf.setFontSize(12);
      pdf.setTextColor(80);
      pdf.text("Student Information:", 10, 70);
      pdf.text(`Name: ${selectedInvoice.studentDisplayName || "N/A"}`, 10, 80);
      pdf.text(
          `Email: ${selectedInvoice.student_proxies?.email || "N/A"}`,
          10,
          90
      );

      // Invoice Details
      pdf.setTextColor(80);
      pdf.text("Invoice Details:", 10, 100);
      pdf.text(`Status: ${selectedInvoice.status || "N/A"}`, 10, 110);
      pdf.text(`Amount: ₹${selectedInvoice.amount || "0.00"}`, 10, 120);
      pdf.text(`Title: ${selectedInvoice.title || "N/A"}`, 10, 130);
      pdf.text(`Description: ${selectedInvoice.description || "N/A"}`, 10, 140);
      pdf.text(
          `Classes to Add: ${selectedInvoice.classes || "N/A"}`,
          10,
          150
      );
      pdf.text(
          `Payment Link: classaccess.tech/pay?invoice_id=${selectedInvoice.id}`,
          10,
          160
      );

      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(120);
      pdf.text("Thank you for using Class Access!", 10, 270);
      pdf.text(
          "All rights reserved © Class Access, 2025",
          10,
          275
      );

      // Save PDF
      pdf.save(`Invoice_${selectedInvoice.id || "N/A"}.pdf`);

      toast({
          variant: "success",
          title: "Success",
          description: "Receipt downloaded successfully.",
      });
  } catch (error) {
      toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate receipt. Please try again.",
      });
      console.error("Error generating PDF:", error);
  }
};

const InvoicesTab = () => {
	const [students, setStudents] = useState([])
	const [teacherID, setTeacherID] = useState("")
	const [isFetchingStudents, setIsFetchingStudents] = useState(false)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [selectedStudent, setSelectedStudent] = useState("")

	const [invoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false)
	const [selectedInvoice, setSelectedInvoice] = useState(null)

	const [classes, setClasses] = useState([])
	const [selectedClass, setSelectedClass] = useState("")
	const [filteredStudents, setFilteredStudents] = useState([])
	const [invoiceTitle, setInvoiceTitle] = useState("")
	const [invoiceDescription, setInvoiceDescription] = useState("")
	const [invoiceClasses, setInvoiceClasses] = useState("")
	const [invoiceAmount, setInvoiceAmount] = useState("")

	const [isLoading, setIsLoading] = useState(true)
	const [invoices, setInvoices] = useState([])

	async function fetchInvoices() {
		setIsLoading(true)

		// Fetch invoices
		const { data: invoicesData, error: invoicesError } = await supabaseClient
			.from('invoices')
			.select('*')
		// .eq('class_id', teacherID)

		if (invoicesError) {
			setIsLoading(false)
			return
		}

		// Extract unique student IDs from invoices
		const studentIds = [...new Set(invoicesData.map(i => i.student_proxy_id))]

		// Fetch students
		const { data: studentsData, error: studentsError } = await supabaseClient
			.from('student_proxies')
			.select('id, first_name, last_name, email')
			.in('id', studentIds)

		if (studentsError) {
			setIsLoading(false)
			return
		}

		const studentsMap = new Map(studentsData.map(s => [s.id, s]))
		const invoicesWithStudents = invoicesData.map(invoice => ({
			...invoice, student_proxies: studentsMap.get(invoice.student_proxy_id) || null
		}))

		setInvoices(invoicesWithStudents.sort((a, b) => new Date(b.date) - new Date(a.date)))
		setIsLoading(false)
	}

	useEffect(() => {
		if (teacherID) {
			fetchInvoices()
		}
	}, [teacherID])

	function resetForm() {
		setSelectedClass("")
		setSelectedStudent("")
		setInvoiceTitle("")
		setInvoiceDescription("")
		setInvoiceClasses("")
		setInvoiceAmount("")
	}

	async function fetchClasses() {
		const { data: classesData, error: classesError } = await supabaseClient
			.from('classes')
			.select('id, class_code, student_proxy_ids,name')
			.eq('teacher_id', teacherID)

		if (classesError) return
		setClasses(classesData)
		const allStudentIds = [...new Set(classesData.flatMap(c => c.student_proxy_ids))]

		const { data: studentsData, error: studentsError } = await supabaseClient
			.from('student_proxies')
			.select('id, first_name, last_name, email')
			.in('id', allStudentIds)

		if (studentsError) return
		const studentsMap = new Map(studentsData.map(s => [s.id, s]))
		const classesWithStudents = classesData.map(c => ({
			...c, students: c.student_proxy_ids.map(id => studentsMap.get(id)).filter(Boolean)
		}))

		setClasses(classesWithStudents)
	}

	useEffect(() => {
		if (teacherID) {
			fetchClasses()
		}
	}, [teacherID])

	useEffect(() => {
		if (selectedClass) {
			const selectedClassData = classes.find(c => c.id === selectedClass)
			setFilteredStudents(selectedClassData ? selectedClassData.students : [])
		} else {
			setFilteredStudents([])
		}
	}, [selectedClass, classes])

	async function createInvoice() {
		if (!selectedClass || !selectedStudent || !invoiceTitle || !invoiceDescription || !invoiceClasses || !invoiceAmount) {
			toast({
				variant: "destructive", title: "Error", description: "Please fill all fields.",
			})
			return
		}

		if (isLoading) return
		setIsLoading(true)
		const { data, error } = await supabaseClient.from('invoices').insert({
			status: 'Pending',
			class_id: selectedClass,
			student_proxy_id: selectedStudent,
			amount: invoiceAmount,
			date: new Date().toISOString(),
			title: invoiceTitle,
			description: invoiceDescription,
			classes: invoiceClasses
		}).select('id')

		if (error) {
			toast({
				variant: "destructive", title: "Error", description: "Error creating invoice. Please try again later.",
			})
			setIsLoading(false)
			return
		}

		const { data: teacherData, error: teacherError } = await supabaseClient.from('teachers').select('email, first_name, last_name').eq('id', teacherID)
		const controller = new AbortController()
		const { signal } = controller;
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
		const email = students.find(s => s.id === selectedStudent).email
		const response = await fetchTimeout(`/api/emails/new_invoice`, 5000, {
			signal, method: 'POST', headers: {
				'Content-Type': 'application/json',
				'jwt': jwt,
				"email": email,
				"teacherName": `${teacherData[0].first_name} ${teacherData[0].last_name}`,
				"teacherEmail": teacherData[0].email,
				"invoice_date": new Date().toLocaleDateString(),
				"title": invoiceTitle,
				"description": invoiceDescription,
				"amount": invoiceAmount,
				"classes": invoiceClasses,
				"invoiceId": data[0].id
			},
		});

		if (response.status !== 200) {
			toast({
				variant: "destructive", title: "Error", description: "Error sending email. Please try again later.",
			})
		}

		toast({
			title: "Success", description: "Invoice created successfully!",
		})
		fetchInvoices()
		resetForm()
		setIsAddDialogOpen(false)
		setIsLoading(false)
	}

	useEffect(() => {
		handleStudentFetch()
	}, [])

	async function handleSavePaymentAndClasses() {
		if(isLoading) return
		setIsLoading(true)
		const { data, error } = await supabaseClient
			.from('payments')
			.insert({
				teacher_id: teacherID,
				class_id: selectedInvoice.class_id,
				student_proxy_id: selectedInvoice.student_proxy_id,
				date: new Date().toDateString(),
				amount: parseFloat(selectedInvoice.amount),
				type: "UPI",
				notes: `${selectedInvoice.title}: ${selectedInvoice.description}`
			})

		const {data: studentData, error: studentError} = await supabaseClient.from('student_proxies').select('classes_left').eq('id', selectedInvoice.student_proxy_id)
		const controller = new AbortController()
		const { signal } = controller
		const url = `${window.location.origin}/api/students/update_classes`
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
		const response = await fetchTimeout(url, 5000, {
			method: 'PUT',
			headers: {
				'jwt': jwt,
				'student_proxy_id': selectedInvoice.student_proxy_id,
				'class_id': selectedInvoice.class_id,
				'classes_left': parseInt(studentData[0].classes_left[selectedInvoice.class_id]) + selectedInvoice.classes
			},
			signal
		})

		if (response.status !== 200) {
			toast({ variant: "destructive", title: "Error", description: "Error saving payment. Please try again." })
		}
		if (error) {
			toast({
				variant: "destructive", title: "Error", description: "Error saving payment. Please try again.",
			})
		}
		setIsLoading(false)
		fetchInvoices()
		setInvoiceDetailsOpen(false)
		return true
	}

	async function handleStudentFetch() {
		if (isFetchingStudents) return
		setIsFetchingStudents(true)
		const teacherUUID = (await supabaseClient.auth.getUser()).data.user.id
		setTeacherID(teacherUUID)

		const { data: classesInfo, error: classesError } = await supabaseClient
			.from('classes')
			.select('id, class_code, student_proxy_ids')
			.eq('teacher_id', teacherUUID)

		if (classesError) {
			setIsFetchingStudents(false)
			return
		}

		const studentIds = [...new Set(classesInfo.flatMap(c => c.student_proxy_ids))]

		const { data: studentInfo, error: studentError } = await supabaseClient
			.from('student_proxies')
			.select('id,first_name,last_name,email,status,classes_left,hasJoined')
			.in('id', studentIds)

		if (studentError) {
			setIsFetchingStudents(false)
			return
		}

		const studentsWithClasses = studentInfo.flatMap(student => classesInfo
			.filter(c => c.student_proxy_ids.includes(student.id))
			.map(c => ({
				...student,
				class_code: c.class_code,
				has_joined: Boolean(student.hasJoined),
				classes_left: student.classes_left[c.id]
			}))
		)

		setStudents(studentsWithClasses)
		setIsFetchingStudents(false)
	}

	const monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	const UserRow = ({ invoiceInfo }) => {
		const { date, amount, title, status, student_proxies } = invoiceInfo
		const { first_name, last_name, email } = student_proxies || {}
		let studentName = "Student Invited"
		let studentEmail = email || "N/A"

		if (first_name && last_name) {
			studentName = `${first_name} ${last_name}`
		}

		const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase()
		const invoiceDate = new Date(date)

		const handleClick = () => {
			setInvoiceDetailsOpen(true)
			const displayDate = `${invoiceDate.getUTCDate()} ${monthStrings[invoiceDate.getUTCMonth()]} ${invoiceDate.getUTCFullYear()}`
			setSelectedInvoice({ ...invoiceInfo, "studentDisplayName": studentName, "invoiceDisplayDate": displayDate })
		}

		return (
			<TableRow onClick={handleClick} className="hover:cursor-pointer">
				<TableCell>
					<div className="flex items-center gap-2">
						<Avatar className="w-8 h-8">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div>{studentName}</div>
					</div>
				</TableCell>
				<TableCell>{studentEmail}</TableCell>
				<TableCell>{invoiceDate.getUTCDate()} {monthStrings[invoiceDate.getUTCMonth()]} {invoiceDate.getUTCFullYear()}</TableCell>
				<TableCell>{title}</TableCell>
				<TableCell>{amount}</TableCell>
				<TableCell>{status}</TableCell>
			</TableRow>
		)
	}

	async function resendInvoice() {
		if (selectedInvoice == null) {
			toast({
				variant: "destructive", title: "Error", description: "Unable to Resent invoice, please try again later",
			})
			return
		}
		if (isLoading) return
		setIsLoading(true)

		const { data: teacherData, error: teacherError } = await supabaseClient.from('teachers').select('email, first_name, last_name').eq('id', teacherID)
		const controller = new AbortController()
		const { signal } = controller;
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
		const response = await fetchTimeout(`/api/emails/new_invoice`, 5000, {
			signal, method: 'POST', headers: {
				'Content-Type': 'application/json',
				'jwt': jwt,
				"email": selectedInvoice.student_proxies.email,
				"teacherName": `${teacherData[0].first_name} ${teacherData[0].last_name}`,
				"teacherEmail": teacherData[0].email,
				"invoice_date": new Date(selectedInvoice.date).toLocaleDateString(),
				"title": selectedInvoice.title,
				"description": selectedInvoice.description,
				"amount": selectedInvoice.amount,
				"classes": selectedInvoice.classes,
				"invoice_id": selectedInvoice.id,
			},
		});

		if (response.status !== 200) {
			toast({
				variant: "destructive", title: "Error", description: "Error sending email. Please try again later.",
			})
		} else {
			toast({
				variant: "success", title: "Success", description: "Invoice resent successfully!",
			})
		}
		setInvoiceDetailsOpen(false)
		setIsLoading(false)
	}
	async function handleMarkConfirmed() {
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
		const result = fetch('/api/system/payment_stats', {headers: {'Content-Type': 'application/json', 'jwt': jwt, 'payment_value': selectedInvoice.amount}, method: 'PUT'})
		// Send confirmation email to students
		handleMarkPaid()
	}

	async function handleMarkPaid() {
		setIsLoading(true)
		const  {data, error} = await supabaseClient.from('invoices').update({ status: 'Paid' }).eq('id', selectedInvoice.id).select()
		const result = await handleSavePaymentAndClasses()
		if (result) {
			toast({
				className:"bg-green-500", title: "Success", description: "Marked Invoice as Paid and added Payment and Classes",
			})
		}
		setIsLoading(false)
	}

	async function handleNotReceived() {
		setIsLoading(true)
		const  {data, error} = await supabaseClient.from('invoices').update({ status: 'Pending' }).eq('id', selectedInvoice.id).select()
		if (data) {
			toast({
				className:"bg-green-500", title: "Success", description: "Marked Invoice as Pending",
			})
		}
		fetchInvoices()
		setInvoiceDetailsOpen(false)
		setIsLoading(false)
	}

	return (
		<>
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} className="bg-white">
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>New Invoice</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="class">Class</Label>
							<Select id="class" value={selectedClass} onValueChange={setSelectedClass}>
								<SelectTrigger>
									<SelectValue placeholder="Select class" />
								</SelectTrigger>
								<SelectContent>
									{classes.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="student">Student</Label>
							<Select id="student" value={selectedStudent} onValueChange={setSelectedStudent}>
								<SelectTrigger>
									<SelectValue placeholder="Select student" />
								</SelectTrigger>
								<SelectContent>
									{filteredStudents.map(s => (<SelectItem key={s.id} value={s.id}>
										{s.first_name && s.last_name ? `${s.first_name} ${s.last_name}` : s.email}
									</SelectItem>))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="itemTitle">Invoice Item Title</Label>
							<Input id="itemTitle" placeholder="Classes for Student Name" value={invoiceTitle}
								onChange={(e) => setInvoiceTitle(e.target.value)} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Input id="description" placeholder="For months ... to ..." value={invoiceDescription}
								onChange={(e) => setInvoiceDescription(e.target.value)} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="classesNumber">Number of Classes</Label>
							<Input id="classesNumber" type="number" placeholder="Classes" value={invoiceClasses}
								onChange={(e) => setInvoiceClasses(e.target.value)} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="amount">Amount</Label>
							<Input id="amount" type="number" placeholder="Enter amount" value={invoiceAmount}
								onChange={(e) => setInvoiceAmount(e.target.value)} />
						</div>
					</div>
					<DialogFooter>
						<div>
							<Button onClick={createInvoice} className={(isLoading ? "cursor-progress" : "")}>Create Invoice</Button></div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog open={invoiceDetailsOpen} onOpenChange={setInvoiceDetailsOpen} className="bg-white">
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Invoice Details</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid gap-2">
							<div><span className="font-medium">Date:</span> { selectedInvoice !== null && selectedInvoice.invoiceDisplayDate}</div>
						</div>
						<div className="grid gap-2">
							<div><span className="font-medium">Student Name:</span> { selectedInvoice !== null && selectedInvoice.studentDisplayName}</div>
						</div>
						<div className="grid gap-2">
							<div><span className="font-medium">Student Email:</span> { selectedInvoice !== null && selectedInvoice.student_proxies.email}</div>
						</div>
						<div className="grid gap-2">
							<div><span className="font-medium">Status:</span> { selectedInvoice !== null && selectedInvoice.status}</div>
						</div>
						<div className="grid gap-2">
							<div><span className="font-medium">Amount:</span> &#8377;{ selectedInvoice !== null && selectedInvoice.amount}</div>
						</div>
						<div className="grid gap-2">
							<div><span className="font-medium">Title:</span> { selectedInvoice !== null && selectedInvoice.title}</div>
						</div>
						<div className="grid gap-2">
							<div><span className="font-medium">Description:</span> { selectedInvoice !== null && selectedInvoice.description}</div>
						</div>
						<div className="grid gap-2">
							<div><span className="font-medium">Classes to Add:</span> { selectedInvoice !== null && selectedInvoice.classes}</div>
						</div>
						<div className="grid gap-2">
							<div><span className="font-medium">Payment Link:</span> { selectedInvoice !== null && (`classaccess.tech/pay?invoice_id=${selectedInvoice.id}`)}</div>
						</div>
					</div>
					{ selectedInvoice !== null && selectedInvoice.status == "Pending" &&
						<DialogFooter>
							<div className="flex justify-between flex-wrap w-full">
								<Button onClick={handleMarkPaid} className={"bg-green-600 hover:bg-green-800" + (isLoading ? " cursor-progress" : "")}>Mark Received</Button>
								<Button     onClick={() =>
                downloadDialogAsPDF({
            selectedInvoice,
            toast,
            dialogElementId: "invoice-dialog-content",
        })
    } className={"bg-blue-600 hover:bg-blue-500"+(isLoading ? "cursor-progress" : "")}>Download Invoice</Button>
								<Button onClick={resendInvoice} className={(isLoading ? "cursor-progress" : "")}>Resend Invoice</Button>
							</div>
						</DialogFooter>
					}
					{ selectedInvoice !== null && selectedInvoice.status == "Student Confirmed" &&
						<DialogFooter>
							<div className="flex justify-between flex-wrap w-full">
								<Button onClick={handleMarkConfirmed} className={"bg-green-600 hover:bg-green-800" + (isLoading ? " cursor-progress" : "")}>Mark Confirmed</Button>
								<Button onClick={handleNotReceived} className={"bg-red-500 hover:bg-red-700" + (isLoading ? " cursor-progress" : "")}>Did Not Receive</Button>
							</div>
						</DialogFooter>
					}
				</DialogContent>
			</Dialog>
			<div>
				<Card>
					<CardHeader>
						<CardTitle className="p-3 flex flex-row justify-between flex-wrap">
							<div>Invoices</div>
							<Button size="sm" className="h-7 gap-1 hover:bg-zinc-700">
								<PlusCircle className="h-3.5 w-3.5" />
								<span className="sr-only sm:not-sr-only sm:whitespace-nowrap"
									onClick={() => setIsAddDialogOpen(true)}>
								New Invoice
								</span>
							</Button>
						</CardTitle>
					</CardHeader>
					{students.length > 0 && teacherID ? (<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Student</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices.map((invoice) => (<UserRow key={invoice.id} invoiceInfo={invoice} />))}
							</TableBody>
						</Table>
					</CardContent>) : ((isFetchingStudents) ? (
						<CardContent className="p-8 pt-0 text-gray-500">Loading Payments...</CardContent>) : (
						<CardContent className="p-8 pt-0 text-gray-500">Please add payments to view them
						here</CardContent>))}
				</Card>
			</div>
		</>
	)
}

export default InvoicesTab
