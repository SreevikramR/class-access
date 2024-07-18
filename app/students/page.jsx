"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { fetchStudentList, supabaseClient } from '@/components/util_function/supabaseCilent'
import AuthWrapper from '@/components/page_components/authWrapper'

const Students = () => {
	const [students, setStudents] = useState([])
	const [teacherID, setTeacherID] = useState("")
	const [studentDataLoaded, setStudentDataLoaded] = useState(false)
	const [isFetchingStudents, setIsFetchingStudents] = useState(false)

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

		const studentsWithClasses = studentInfo.flatMap(student =>
			classesInfo
				.filter(c => c.student_proxy_ids.includes(student.id))
				.map(c => ({
					...student,
					class_code: c.class_code,
					has_joined: Boolean(student.hasJoined),
					classes_left: student.classes_left[c.id]
				}))
		)

		setStudents(studentsWithClasses)
		setStudentDataLoaded(true)
		setIsFetchingStudents(false)
	}

	const UserRow = ({ studentInfo }) => {
		console.log('studentInfo:', studentInfo);

		const router = useRouter()
		const { first_name, last_name, status, email, id, class_code, has_joined, classes_left } = studentInfo
		let studentFirstName = first_name
		let studentLastName = last_name
		let studentStatus = status
		let studentEmail = email
		let statusClassName = ""

		if (studentStatus === null) {
			studentFirstName = "New"
			studentLastName = "Student"
			statusClassName = "text-black border-black"
		} else if (studentStatus === "Unpaid") {
			statusClassName = "bg-red-400"
		} else if (studentStatus === "Paid") {
			statusClassName = "bg-green-400 px-5"
		}

		let studentName = studentFirstName + " " + studentLastName
		const words = studentName.split(' ')
		const firstLetters = words.map(word => word.charAt(0))
		const initials = firstLetters.join('')

		return (<TableRow>
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
				<Badge variant="success" className={statusClassName}>{has_joined ? 'Yes' : 'No'}</Badge>
			</TableCell>
			<TableCell>{class_code}</TableCell>
			<TableCell>{classes_left}</TableCell>
		</TableRow>)
	};
	return (<AuthWrapper>
		<div className="flex flex-col min-h-screen">
			<Header />
			<main className="flex-1 bg-gray-100 p-6 md:p-10 md:pt-8">
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="p-3">My Students</CardTitle>
						</CardHeader>
						{students.length > 0 && teacherID ? (<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Student</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Class Code</TableHead>
										<TableHead>Classes Left</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{studentDataLoaded && students.map((student) => (
										<UserRow key={`${student.id}-${student.class_code}`}
											studentInfo={student} />))}
								</TableBody>
							</Table>
						</CardContent>) : ((isFetchingStudents) ? (
							<CardContent className="p-8 pt-0 text-gray-500">Loading Student
								Information...</CardContent>) : (
							<CardContent className="p-8 pt-0 text-gray-500">Please create a class and add some
								students to view them here</CardContent>))}
					</Card>
				</div>
			</main>
			<Footer />
		</div>
	</AuthWrapper>)
}

export default Students
