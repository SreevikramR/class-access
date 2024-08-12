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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast";
import fetchTimeout from '@/components/util_function/fetch'

const PaymentsTab = () => {
	const [students, setStudents] = useState([])
	const [teacherID, setTeacherID] = useState("")
	const [isFetchingStudents, setIsFetchingStudents] = useState(false)
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [selectedStudent, setSelectedStudent] = useState("")

	const [classes, setClasses] = useState([])
	const [selectedClass, setSelectedClass] = useState("")
	const [filteredStudents, setFilteredStudents] = useState([])

	const [classesToAdd, setClassesToAdd] = useState(8)
	const [paymentDate, setPaymentDate] = useState("")
	const [paymentAmount, setPaymentAmount] = useState("")
	const [paymentMethod, setPaymentMethod] = useState("")
	const [transactionId, setTransactionId] = useState("")
	const [notes, setNotes] = useState("")
	const [payments, setPayments] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	async function fetchPayments() {
		setIsLoading(true)

		// Fetch payments
		const { data: paymentsData, error: paymentsError } = await supabaseClient
			.from('payments')
			.select('*')
			.eq('teacher_id', teacherID)

		if (paymentsError) {
			console.error('Error fetching payments:', paymentsError.message, paymentsError.details, paymentsError.hint)
			setIsLoading(false)
			return
		}

		// Extract unique student IDs from payments
		const studentIds = [...new Set(paymentsData.map(p => p.student_proxy_id))]

		// Fetch students
		const { data: studentsData, error: studentsError } = await supabaseClient
			.from('student_proxies')
			.select('id, first_name, last_name, email')
			.in('id', studentIds)

		if (studentsError) {
			console.error('Error fetching students:', studentsError.message, studentsError.details, studentsError.hint)
			setIsLoading(false)
			return
		}

		// Create a map of student data for easy lookup
		const studentsMap = new Map(studentsData.map(s => [s.id, s]))

		// Combine payment and student data
		const paymentsWithStudents = paymentsData.map(payment => ({
			...payment, student_proxies: studentsMap.get(payment.student_proxy_id) || null
		}))

		console.log('Payments with students:', paymentsWithStudents)
		setPayments(paymentsWithStudents.sort((a, b) => new Date(b.date) - new Date(a.date)))
		setIsLoading(false)
	}

	useEffect(() => {
		if (teacherID) {
			fetchClasses()
			fetchPayments()
		}
	}, [teacherID])

	function resetForm() {
		setSelectedClass("")
		setSelectedStudent("")
		setPaymentDate("")
		setPaymentAmount("")
		setPaymentMethod("")
		setTransactionId("")
		setNotes("")
	}

	async function fetchClasses() {
		const { data: classesData, error: classesError } = await supabaseClient
			.from('classes')
			.select('id, class_code, student_proxy_ids,name')
			.eq('teacher_id', teacherID)

		if (classesError) {
			console.error('Error fetching classes:', classesError)
			return
		}

		setClasses(classesData)

		const allStudentIds = [...new Set(classesData.flatMap(c => c.student_proxy_ids))]

		const { data: studentsData, error: studentsError } = await supabaseClient
			.from('student_proxies')
			.select('id, first_name, last_name, email')
			.in('id', allStudentIds)

		if (studentsError) {
			console.error('Error fetching students:', studentsError)
			return
		}

		const studentsMap = new Map(studentsData.map(s => [s.id, s]))

		const classesWithStudents = classesData.map(c => ({
			...c, students: c.student_proxy_ids.map(id => studentsMap.get(id)).filter(Boolean)
		}))

		setClasses(classesWithStudents)
	}

	useEffect(() => {
		if (selectedClass) {
			const selectedClassData = classes.find(c => c.id === selectedClass)
			setFilteredStudents(selectedClassData ? selectedClassData.students : [])
		} else {
			setFilteredStudents([])
		}
	}, [selectedClass, classes])

	async function handleSavePayment() {
		if (isLoading) {
			return
		}
		setIsLoading(true)
		if (!selectedClass || !selectedStudent || !paymentDate || !paymentAmount || !paymentMethod) {
			toast({
				variant: "destructive", title: "Error", description: "Please fill all required fields",
			})
			return
		}

		const { data, error } = await supabaseClient
			.from('payments')
			.insert({
				teacher_id: teacherID,
				class_id: selectedClass,
				student_proxy_id: selectedStudent,
				date: paymentDate,
				amount: parseFloat(paymentAmount),
				type: paymentMethod,
				transaction_id: transactionId,
				notes: notes
			})

		const {data: studentData, error: studentError} = await supabaseClient.from('student_proxies').select('classes_left').eq('id', selectedStudent)
		const controller = new AbortController()
		const { signal } = controller
		const url = `${window.location.origin}/api/students/update_classes`
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
		const response = await fetchTimeout(url, 5000, {
			method: 'PUT',
			headers: {
				'jwt': jwt,
				'student_proxy_id': selectedStudent,
				'class_id': selectedClass,
				'classes_left': parseInt(studentData[0].classes_left[selectedClass]) + parseInt(classesToAdd)
			},
			signal
		})

		if (response.status !== 200) {
			console.error('Error updating classes:', response.statusText)
			toast({ variant: "destructive", title: "Error", description: "Error saving payment. Please try again." })
			console.log('Not saving')
			setIsLoading(false)
			return
		}

		if (error) {
			console.error('Error saving payment:', error)
			toast({
				variant: "destructive", title: "Error", description: "Error saving payment. Please try again.",
			})
		} else {
			toast({
				title: "Success", description: "Payment saved successfully!",
			})
			setIsAddDialogOpen(false)
			resetForm()
			fetchClasses()
			fetchPayments()
		}
		setIsLoading(false)
	}

	useEffect(() => {
		handleStudentFetch()
	}, [])

	async function handleStudentFetch() {
		if (isFetchingStudents) {
			return
		}
		setIsFetchingStudents(true)
		const teacherUUID = (await supabaseClient.auth.getUser()).data.user.id
		setTeacherID(teacherUUID)

		const { data: classesInfo, error: classesError } = await supabaseClient
			.from('classes')
			.select('id, class_code, student_proxy_ids')
			.eq('teacher_id', teacherUUID)

		if (classesError) {
			console.error('Error fetching classes data:', classesError)
			setIsFetchingStudents(false)
			return
		}

		const studentIds = [...new Set(classesInfo.flatMap(c => c.student_proxy_ids))]

		const { data: studentInfo, error: studentError } = await supabaseClient
			.from('student_proxies')
			.select('id,first_name,last_name,email,status,classes_left,hasJoined')
			.in('id', studentIds)

		if (studentError) {
			console.error('Error fetching student data:', studentError)
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
			})))

		setStudents(studentsWithClasses)
		setIsFetchingStudents(false)
	}

	const monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	const UserRow = ({ paymentInfo }) => {
		const { date, amount, type, student_proxies } = paymentInfo
		const { first_name, last_name, email } = student_proxies || {}

		let studentName = "Student Invited"
		let studentEmail = email || "N/A"

		if (first_name && last_name) {
			studentName = `${first_name} ${last_name}`
		}

		const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase()
		const paymentDate = new Date(date)

		return (<TableRow>
			<TableCell>
				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8">
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div>{(studentName) ? studentName : 'Student Invited'}</div>
				</div>
			</TableCell>
			<TableCell>{studentEmail}</TableCell>
			<TableCell>{paymentDate.getUTCDate()} {monthStrings[paymentDate.getUTCMonth()]} {paymentDate.getUTCFullYear()}</TableCell>
			<TableCell>{type}</TableCell>
			<TableCell>{amount}</TableCell>
		</TableRow>)
	}

	return (
		<>
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} className="bg-white">
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Add Payment</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="date">Date</Label>
							<Input id="date" type="date" value={paymentDate}
								onChange={(e) => setPaymentDate(e.target.value)} />
						</div>
						<div className="grid gap-2">
							<div className='flex flex-row w-full'>
								<div className='flex-col w-1/2 pr-2'>
									<Label htmlFor="amount">Amount</Label>
									<Input id="amount" type="number" placeholder="Enter amount" value={paymentAmount}
										onChange={(e) => setPaymentAmount(e.target.value)} />
								</div>
								<div className='flex-col w-1/2 pl-2'>
									<Label htmlFor="amount">Add Classes</Label>
									<Input id="amount" type="number" placeholder="Add Classes to Student" value={classesToAdd}
										onChange={(e) => setClassesToAdd(e.target.value)} />
								</div>
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="class">Class</Label>
							<Select id="class" value={selectedClass} onValueChange={setSelectedClass} >
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
							<Select id="student" value={selectedStudent} onValueChange={setSelectedStudent} >
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
							<Label htmlFor="method">Payment Method</Label>
							<Select id="method" value={paymentMethod} onValueChange={setPaymentMethod}>
								<SelectTrigger>
									<SelectValue placeholder="Select payment method" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem className="hover:cursor-pointer hover:bg-slate-100"
										value="UPI">UPI</SelectItem>
									<SelectItem className="hover:cursor-pointer hover:bg-slate-100"
										value="Bank Transfer">Bank Transfer</SelectItem>
									<SelectItem className="hover:cursor-pointer hover:bg-slate-100"
										value="Cash">Cash</SelectItem>
									<SelectItem className="hover:cursor-pointer hover:bg-slate-100"
										value="Credit Card">Credit Card</SelectItem>
									<SelectItem className="hover:cursor-pointer hover:bg-slate-100"
										value="Other">Other</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="amount">Transaction ID</Label>
							<Input id="id" placeholder="Transaction Identification Number" value={transactionId}
								onChange={(e) => setTransactionId(e.target.value)} />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="notes">Notes</Label>
							<Textarea id="notes" placeholder="Add any notes" value={notes}
								onChange={(e) => setNotes(e.target.value)} />
						</div>
					</div>
					<DialogFooter>
						<div>
							<Button className={(isLoading) ? "cursor-progress" : ""} onClick={handleSavePayment}>Save Payment</Button></div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<div>
				<Card>
					<CardHeader>
						<CardTitle className="p-3 flex flex-row justify-between flex-wrap">
							<div>Payments</div>
							<Button size="sm" className="h-7 gap-1 hover:bg-zinc-700">
								<PlusCircle className="h-3.5 w-3.5" />
								<span className="sr-only sm:not-sr-only sm:whitespace-nowrap"
									onClick={() => setIsAddDialogOpen(true)}>
                                    Add Payment
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
									<TableHead>Payment Mode</TableHead>
									<TableHead>Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{payments.map((payment) => (<UserRow key={payment.id} paymentInfo={payment} />))}
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

export default PaymentsTab
