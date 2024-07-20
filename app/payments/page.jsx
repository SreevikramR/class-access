"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetchStudentList, supabaseClient } from '@/components/util_function/supabaseCilent'
import AuthWrapper from '@/components/page_components/authWrapper'
import { Button } from '@/components/ui/button'
import { PlusCircle, CalendarIcon } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PopoverContent } from '@/components/ui/popover'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const Payments = () => {
    const [students, setStudents] = useState([])
    const [teacherID, setTeacherID] = useState("")
    const [studentDataLoaded, setStudentDataLoaded] = useState(false)
    const [isFetchingStudents, setIsFetchingStudents] = useState(false)

    const [date, setDate] = useState(new Date())
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    function DatePickerPopup() {
        return (<PopoverContent className="w-[auto] p-0">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
            />
        </PopoverContent>);
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
        const { first_name, last_name, email, id, class_code, has_joined, classes_left } = studentInfo
        let studentFirstName = first_name
        let studentLastName = last_name
        let studentStatus = has_joined
        let studentEmail = email
        let statusClassName = ""

        if (studentStatus === false) {
            studentFirstName = "Student"
            studentLastName = "Invited"
            statusClassName = "text-black border-black"
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
            <TableCell>01/01/2024</TableCell>
            <TableCell>UPI</TableCell>
            <TableCell>800</TableCell>
        </TableRow>)
    };
    return (<AuthWrapper>
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-gray-100 p-6 md:p-10 md:pt-8">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} className="bg-white">                    
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add Payment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" type="date" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input id="amount" type="number" placeholder="Enter amount" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="method">Payment Method</Label>
                                <Select id="method">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem className="hover:cursor-pointer hover:bg-slate-100" value="upi">UPI</SelectItem>
                                        <SelectItem className="hover:cursor-pointer hover:bg-slate-100" value="bank-transfer">Bank Transfer</SelectItem>
                                        <SelectItem className="hover:cursor-pointer hover:bg-slate-100" value="cash">Cash</SelectItem>
                                        <SelectItem className="hover:cursor-pointer hover:bg-slate-100" value="credit-ard">Credit Card</SelectItem>
                                        <SelectItem className="hover:cursor-pointer hover:bg-slate-100" value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Transaction ID</Label>
                                <Input id="id" placeholder="Transaction Identification Number" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" placeholder="Add any notes" />
                            </div>
                        </div>
                        <DialogFooter>
                            <div>
                                <Button>Save Payment</Button>
                            </div>
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
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap" onClick={() => setIsAddDialogOpen(true)}>
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
                                    {studentDataLoaded && students.map((student) => (
                                        <UserRow key={`${student.id}-${student.class_code}`}
                                            studentInfo={student} />))}
                                </TableBody>
                            </Table>
                        </CardContent>) : ((isFetchingStudents) ? (
                            <CardContent className="p-8 pt-0 text-gray-500">Loading Payments...</CardContent>) : (
                            <CardContent className="p-8 pt-0 text-gray-500">Please add payments to view them here</CardContent>))}
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    </AuthWrapper>)
}

export default Payments