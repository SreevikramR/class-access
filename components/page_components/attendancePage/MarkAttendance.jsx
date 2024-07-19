"use client"
import React, {useEffect, useState} from 'react'
import {supabaseClient} from '@/components/util_function/supabaseCilent'
import {Button} from '@/components/ui/button'
import {Checkbox} from '@/components/ui/checkbox'
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {toast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";

const MarkAttendance = () => {
	const [students, setStudents] = useState([])
	const [teacherID, setTeacherID] = useState("")
	const [studentDataLoaded, setStudentDataLoaded] = useState(false)
	const [isFetchingStudents, setIsFetchingStudents] = useState(false)
	const [attendanceRecords, setAttendanceRecords] = useState([])
	
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
		
		const {data: classesInfo, error: classesError} = await supabaseClient
			.from('classes')
			.select('id, class_code, student_proxy_ids')
			.eq('teacher_id', teacherUUID)
		
		if (classesError) {
			console.error('Error fetching classes data:', classesError)
			setIsFetchingStudents(false)
			return
		}
		
		const studentIds = [...new Set(classesInfo.flatMap(c => c.student_proxy_ids))]
		
		const {data: studentInfo, error: studentError} = await supabaseClient
			.from('student_proxies')
			.select('id, first_name, last_name, email, status, classes_left, hasJoined')
			.in('id', studentIds)
		
		if (studentError) {
			console.error('Error fetching student data:', studentError)
			setIsFetchingStudents(false)
			return
		}
		
		const studentsWithClasses = studentInfo.flatMap(student => classesInfo
			.filter(c => c.student_proxy_ids.includes(student.id))
			.map(c => ({
				...student, class_code: c.class_code, class_id: c.id, // Added class_id for attendance record
				has_joined: Boolean(student.hasJoined), classes_left: student.classes_left[c.id]
			})))
		
		setStudents(studentsWithClasses)
		setStudentDataLoaded(true)
		setIsFetchingStudents(false)
	}
	
	const handleAttendanceChange = (classId, studentId, checked) => {
		const updatedRecords = [...attendanceRecords]
		const recordIndex = updatedRecords.findIndex(record => record.class_id === classId && record.student_proxy_id === studentId)
		
		if (recordIndex > -1) {
			updatedRecords[recordIndex].isPresent = checked
		} else {
			updatedRecords.push({
				class_id: classId, student_proxy_id: studentId, date: new Date().toISOString().split('T')[0], // Today's date
				isPresent: checked
			})
		}
		
		setAttendanceRecords(updatedRecords)
	}
	
	const saveAttendance = async () => {
		try {
			const {error} = await supabaseClient
				.from('attendance_records')
				.upsert(attendanceRecords)
			
			if (error) throw error
			
			toast({name: 'Attendance saved successfully.', variant: 'success'})
		} catch (error) {
			console.error('Error saving attendance:', error)
			toast({name: 'Failed to save attendance. Please try again.', variant: 'destructive'})
		}
	}
	
	const UserRow = ({studentInfo}) => {
		
		
		const router = useRouter()
		const {first_name, last_name, email, id, class_code, has_joined, class_id} = studentInfo
		let studentFirstName = first_name
		let studentLastName = last_name
		let studentStatus = has_joined
		let studentEmail = email
		let statusClassName = ""
		
		if (studentStatus === false) {
			studentFirstName = "Student"
			studentLastName = "Invited"
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
						<div>{studentName}</div>
					</div>
				</TableCell>
				<TableCell>{email}</TableCell>
				{/*<TableCell>*/}
				{/*  /!*<Badge variant="success">{has_joined ? 'Yes' : 'No'}</Badge>*!/*/}
				{/*</TableCell>*/}
				<TableCell>{class_code}</TableCell>
				{/*<TableCell>{classes_left}</TableCell>*/}
				<TableCell>
					<Checkbox
						onCheckedChange={(checked) => handleAttendanceChange(class_id, id, checked)}
					/>
				</TableCell>
			</TableRow>)
	}
	
	return (<Card>
			<CardHeader>
				<CardTitle className="p-3">Mark Attendance</CardTitle>
			</CardHeader>
			{students.length > 0 && teacherID ? (<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Student</TableHead>
								<TableHead>Email</TableHead>
								{/*<TableHead>Status</TableHead>*/}
								<TableHead>Class Code</TableHead>
								{/*<TableHead>Classes Left</TableHead>*/}
								<TableHead>Present</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{studentDataLoaded && students.map((student) => (
								<UserRow key={`${student.id}-${student.class_code}`} studentInfo={student}/>))}
						</TableBody>
					</Table>
					<Button onClick={saveAttendance} className="mt-4">Save Attendance</Button>
				</CardContent>) : (<CardContent className="p-8 pt-0 text-gray-500">
					{isFetchingStudents ? "Loading Student Information..." : "Please create a class and add some students to view them here"}
				</CardContent>)}
		</Card>)
}

export default MarkAttendance
