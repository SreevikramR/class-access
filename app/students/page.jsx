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

        const { data: studentInfo, error } = await supabaseClient
            .from('student_proxies')
            .select('id,first_name,last_name,email,status,classes_left')
            .eq('teacher_id', teacherUUID)

        if (error) {
            console.error('Error fetching student data:', error)
            setIsFetchingStudents(false)
            return
        }

        setStudents(studentInfo)
        setStudentDataLoaded(true)
        setIsFetchingStudents(false)
    }

    const UserRow = ({ studentInfo }) => {
		console.log('studentInfo:', studentInfo);

        const router = useRouter()
        const { first_name, last_name, status, email, id } = studentInfo
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

        return (
            <TableRow onClick={() => { router.push(`/student/${id}`) }} className="cursor-pointer">
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
                
            </TableRow>
        )
    }

    return (
        <AuthWrapper>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 bg-gray-100 p-6 md:p-10 md:pt-8">
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="p-3">My Students</CardTitle>
                            </CardHeader>
                            {students.length > 0 && teacherID ? (
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {studentDataLoaded && students.map((student) => (
                                                <UserRow key={student.id} studentInfo={student} />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            ) : ((isFetchingStudents) ? (
                                <CardContent className="p-8 pt-0 text-gray-500">Loading Student Information...</CardContent>
                            ) : (
                                <CardContent className="p-8 pt-0 text-gray-500">Please create a class and add some students to view them here</CardContent>
                            ))}
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        </AuthWrapper>
    )
}

export default Students
