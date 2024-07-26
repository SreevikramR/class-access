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

const InvoicesTab = () => {
    const [students, setStudents] = useState([])
    const [teacherID, setTeacherID] = useState("")
    const [isFetchingStudents, setIsFetchingStudents] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState("")

    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState("")
    const [filteredStudents, setFilteredStudents] = useState([])
    const [invoiceTitle, setInvoiceTitle] = useState("")
    const [invoiceDescription, setInvoiceDescription] = useState("")
    const [invoiceClasses, setInvoiceClasses] = useState("")
    const [invoiceAmount, setInvoiceAmount] = useState("")

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
        setPayments(paymentsWithStudents)
        setIsLoading(false)
    }

    useEffect(() => {
        if (teacherID) {
            fetchPayments()
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
        console.log('selectedClass:', selectedClass);
        console.log('selectedStudent:', students);
        const { data, error } = await supabaseClient.from('invoices').insert({
            status: 'Sent',
            class_id: selectedClass,
            student_proxy_id: selectedStudent,
            amount: invoiceAmount,
            date: new Date().toLocaleDateString(),
            title: invoiceTitle,
            description: invoiceDescription,
            classes: invoiceClasses
        })

        if (error) {
            console.error('Error creating invoice:', error)
            toast({
                variant: "destructive", title: "Error", description: "Error creating invoice. Please try again later.",
            })
        }

        const { data: teacherData, error: teacherError } = await supabaseClient.from('teachers').select('email, first_name, last_name').eq('id', teacherID)

        // Send email
        const controller = new AbortController()
        const { signal } = controller;
        const email = students.find(s => s.id === selectedStudent).email
        const response = await fetchTimeout(`/api/emails/new_invoice`, 5000, {
            signal,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "email": email,
                "teacherName": `${teacherData[0].first_name} ${teacherData[0].last_name}`,
                "teacherEmail": teacherData[0].email,
                "invoice_date": new Date().toLocaleDateString(),
                "title": invoiceTitle,
                "description": invoiceDescription,
                "amount": invoiceAmount,
                "classes": invoiceClasses,
            },
        });

        if (response.status !== 200) {
            console.error('Error sending email:', response)
            toast({
                variant: "destructive", title: "Error", description: "Error sending email. Please try again later.",
            })
        }

        toast({
            title: "Success", description: "Invoice created successfully!",
        })
        resetForm()
        setIsAddDialogOpen(false)
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

    const UserRow = ({ paymentInfo }) => {
        const { date, amount, type, student_proxies } = paymentInfo
        const { first_name, last_name, email } = student_proxies || {}

        let studentName = "Student Invited"
        let studentEmail = email || "N/A"

        if (first_name && last_name) {
            studentName = `${first_name} ${last_name}`
        }

        const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase()

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
            <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
            <TableCell>{type}</TableCell>
            <TableCell>{amount}</TableCell>
        </TableRow>)
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
                            <Button onClick={createInvoice}>Create Invoice</Button></div>
                    </DialogFooter>
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

export default InvoicesTab