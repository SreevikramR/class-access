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
import { SortDescIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fetchStudentList, supabaseClient } from '@/components/util_function/supabaseCilent'
import ZoomButton from '/components/ZoomButton';
import AuthWrapper from '@/components/page_components/authWrapper'

const Students = () => {
    const [students, setStudents] = useState([])
    const [teacherID, setTeacherID] = useState("")
    const [studentDataLoaded, setStudentDataLoaded] = useState(false)
    const [isFetchingStudents, setIsFetchingStudents] = useState(false)

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
        <AuthWrapper>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 bg-gray-100 p-6 md:p-10 md:pt-8">
                    
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
                            ) : ((isFetchingStudents) ? (<CardContent className="p-8 pt-0 text-gray-500">Loading Student
                                Information...</CardContent>) : (
                                <CardContent className="p-8 pt-0 text-gray-500">Please create a class and add some students to view them here</CardContent>
                            ))}
                        </Card>
                    </div>
                </main>
                <Footer />
            </div>
        </AuthWrapper >
    )
}

export default Students

