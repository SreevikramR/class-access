"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { SortDescIcon, PlusCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from '@radix-ui/react-dropdown-menu'
import validator from 'validator'
import { useToast } from '@/components/ui/use-toast'
import supabaseClient, { fetchStudentList } from '@/components/util_function/supabaseCilent'
import fetchTimeout from '@/components/util_function/fetch'

const Dashboard = () => {
	const [students, setStudents] = useState([])
	const [email, setEmail] = useState("")
	const [numClasses, setNumClasses] = useState(0)
	const [notes, setNotes] = useState("")
	const [isOpen, setIsOpen] = useState(false)
	const { toast } = useToast()
	const [isCreatingUser, setIsCreatingUser] = useState(false)
	const [teacherID, setTeacherID] = useState("")
	const [studentDataLoaded, setStudentDataLoaded] = useState(false)
	const [isFetchingStudents, setIsFetchingStudents] = useState(false)

	const controller = new AbortController()
	const { signal } = controller;

	useEffect(() => {
		const fetchTeacherID = async () => {
			const teacherUUID = (await supabaseClient.auth.getUser()).data.user.id
			setTeacherID(teacherUUID)
		}
		fetchTeacherID()
		handleStudentFetch()
	}, [])

	const UserRow = (studentInfo) => {
		const router = useRouter();
		let studentFirstName = studentInfo.first_name
		let studentLastName = studentInfo.last_name
		let studentStatus = studentInfo.status[teacherID]
		let studentEmail = studentInfo.email
		let studentClasses = studentInfo.classes_left[teacherID]
		let statusClassName = ""

		if (studentStatus == "Pending") {
			studentFirstName = "New"
			studentLastName = "Student"
			statusClassName = "text-black border-black"
		} else if (studentStatus == "Unpaid") {
			statusClassName = "bg-red-400"
		} else if (studentStatus == "Paid") {
			statusClassName = "bg-green-400 px-5"
		}

		let studentName = studentFirstName + " " + studentLastName
		const words = studentName.split(' ');
		const firstLetters = words.map(word => word.charAt(0));
		const initials = firstLetters.join('');

		return (
			<TableRow onClick={() => { router.push(`/student`) }} className="cursor-pointer">
				<TableCell>
					<div className="flex items-center gap-2">
						<Avatar className="w-8 h-8">
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div>{studentFirstName} {studentLastName}</div>
					</div>
				</TableCell>
				<TableCell>{studentEmail}</TableCell>
				<TableCell>
					<Badge variant="success" className={statusClassName}>{studentStatus}</Badge>
				</TableCell>
				<TableCell>{studentClasses}</TableCell>
			</TableRow>
		)
	}

	const handleNewStudentSubmit = async (e) => {
		if (isCreatingUser) {
			return
		}
		setIsCreatingUser(true)
		e.preventDefault()
		if (!email) {
			return
		}
		if (!validator.isEmail(email)) {
			toast({
				variant: "destructive",
				title: "Invalid Email",
				description: "Please enter a valid email address",
				duration: 3000
			})
			setIsCreatingUser(false)
			return
		}
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token
		const uuid = (await supabaseClient.auth.getUser()).data.user.id
		const url = new URL(`${window.location.origin}/api/users/new_student?email=${email}&classes=${numClasses}&notes=${notes}`)
		try {
			const response = await fetchTimeout(url, 15000, { signal, headers: { jwt: jwt } });
			const data = await response.json();
			console.log(data)
		} catch (error) {
			console.log(error)
			toast({
				variant: "destructive",
				title: "Unable to Create User. Please Try Again Later",
				duration: 3000

			})
			setIsCreatingUser(false)
			return
		}
		toast({
			className: "bg-green-500 border-black border-2",
			title: "Student Successfully Added",
			description: "The new student has been added to your class",
			duration: 3000
		})
		setIsCreatingUser(false)
		handleStudentFetch()
		setIsOpen(false)
	}

	async function handleStudentFetch() {
		if (isFetchingStudents) {
			return
		}
		setIsFetchingStudents(true)
		const teacherUUID = (await supabaseClient.auth.getUser()).data.user.id
		const students = await fetchStudentList(teacherUUID)
		setStudents(students)
		setTeacherID(teacherUUID)
		setStudentDataLoaded(true)
		setIsFetchingStudents(false)
	}

	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 md:p-10 md:pt-8">
				<Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add New Student</DialogTitle>
						</DialogHeader>
						<form className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
							</div>
							<div className="space-y-2">
								<Label htmlFor="numClasses">Classes Balance</Label>
								<div className="flex items-center gap-2">
									<Button type="button" variant="outline" onClick={() => setNumClasses(Math.max(0, numClasses - 1))}>
										-
									</Button>
									<Input
										id="numClasses"
										type="number"
										value={numClasses}
										onChange={(e) => setNumClasses(Number(e.target.value))}
										min={0}
										className="w-16 text-center"
									/>
									<Button type="button" variant="outline" onClick={() => setNumClasses(numClasses + 1)}>
										+
									</Button>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="notes">Notes</Label>
								<Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
							</div>
							<DialogFooter>
								<Button type="button" onClick={handleNewStudentSubmit} className={`${isCreatingUser ? "cursor-progress" : ""}`}>Submit</Button>
								<div>
									<Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
								</div>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
				<div>
					{/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
				<CardHeader>
				<CardTitle>Payment Summary</CardTitle>
				</CardHeader>
				<CardContent>
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
					<div>Total Revenue</div>
					<div className="font-bold">$25,000</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Pending Payments</div>
					<div className="font-bold">$3,500</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Paid Invoices</div>
					<div className="font-bold">$21,500</div>
					</div>
				</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
				<CardTitle>Zoom Access Control</CardTitle>
				</CardHeader>
				<CardContent>
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
					<div>Paying Students</div>
					<div className="font-bold">120</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Non-Paying Students</div>
					<div className="font-bold">15</div>
					</div>
					<Button variant="secondary" size="sm">
					Block Non-Paying Students
					</Button>
				</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
				<CardTitle>Platform Performance</CardTitle>
				</CardHeader>
				<CardContent>
				<div className="grid gap-4">
					<div className="flex items-center justify-between">
					<div>Total Enrollments</div>
					<div className="font-bold">1,250</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Active Students</div>
					<div className="font-bold">950</div>
					</div>
					<div className="flex items-center justify-between">
					<div>Retention Rate</div>
					<div className="font-bold">76%</div>
					</div>
				</div>
				</CardContent>
			</Card>
				</div> */}
				</div>
				<div>
					<div className="flex w-full mb-2">
						<Tabs defaultValue="all" className='flex flex-row content-between w-full'>
							<TabsList>
								<TabsTrigger value="all">All</TabsTrigger>
								<TabsTrigger value="paid">Paid</TabsTrigger>
								<TabsTrigger value="unpaid">Unpaid</TabsTrigger>
								<TabsTrigger value="pending">Pending</TabsTrigger>
							</TabsList>
							<div className="ml-auto flex items-center gap-2">
								<div className="relative ml-auto flex-1 md:grow-0">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Search..."
										className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
									/>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="h-7 gap-1">
											<SortDescIcon className="h-3.5 w-3.5" />
											<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
												Sort
											</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Sort by</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuCheckboxItem checked>
											Name
										</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem>Classes Remaining</DropdownMenuCheckboxItem>
										<DropdownMenuCheckboxItem>
											Payment Status
										</DropdownMenuCheckboxItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<Button size="sm" className="h-7 gap-1" onClick={() => setIsOpen(true)}>
									<PlusCircle className="h-3.5 w-3.5" />
									<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
										Add Student
									</span>
								</Button>
							</div>
						</Tabs>
					</div>
					<Card>
						<CardHeader>
							<CardTitle className="p-3">My Students</CardTitle>
						</CardHeader>
						{students.length > 0 ? (
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Student</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Classes Left</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{studentDataLoaded && students.map((student) => {
											return <UserRow key={student.id} {...student} />
										})}
									</TableBody>
								</Table>
							</CardContent>
						) : ( (isFetchingStudents) ? (<CardContent className="p-8 pt-0 text-gray-500">Loading Student Information...</CardContent>) : (
							<CardContent className="p-8 pt-0 text-gray-500">Please add students using the option at the top right to view them here</CardContent>
						)) }
					</Card>
				</div>
				<Button onClick={handleStudentFetch}>Fetch Test</Button>
			</main>
			<Footer />
		</div>
	)
}

const UserRow2 = () => {
	const router = useRouter();
	return (
		<TableRow onClick={() => { router.push(`/student`) }} className="cursor-pointer">
			<TableCell>
				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8">
						<AvatarImage src="/placeholder-user.jpg" />
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<div>John Smith</div>
				</div>
			</TableCell>
			<TableCell>
				example@example.com
			</TableCell>
			<TableCell>
				<Badge variant="success" className="bg-orange-400 px-3">Unpaid</Badge>
			</TableCell>
			<TableCell>3</TableCell>
		</TableRow>
	)
}

const UserRow3 = () => {
	const router = useRouter();
	return (
		<TableRow onClick={() => { router.push(`/student`) }} className="cursor-pointer">
			<TableCell>
				<div className="flex items-center gap-2">
					<Avatar className="w-8 h-8">
						<AvatarImage src="/placeholder-user.jpg" />
						<AvatarFallback>JS</AvatarFallback>
					</Avatar>
					<div>John Smith</div>
				</div>
			</TableCell>
			<TableCell>
				example@example.com
			</TableCell>
			<TableCell>
				<Badge variant="success" className="text-black border-black">Pending</Badge>
			</TableCell>
			<TableCell>3</TableCell>
		</TableRow>
	)
}

export default Dashboard