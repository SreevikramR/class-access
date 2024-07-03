"use client"
import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { supabaseClient, fetchStudentList } from '@/components/util_function/supabaseCilent'
import { Checkbox } from '@/components/ui/checkbox'

const MarkAttendance = () => {
    const [date, setDate] = useState(new Date())
    const [classSelectOpen, setClassSelectOpen] = React.useState(false)
    const [classSelectValue, setClassSelectValue] = React.useState("Select Class")
    const [students, setStudents] = React.useState([])
    const [isFetchingStudents, setIsFetchingStudents] = React.useState(false)
    const [teacherID, setTeacherID] = React.useState("")
    const [studentDataLoaded, setStudentDataLoaded] = React.useState(false)

    useEffect(() => {
        const fetchTeacherID = async () => {
            const teacherUUID = (await supabaseClient.auth.getUser()).data.user.id
            setTeacherID(teacherUUID)
        }
        fetchTeacherID()
        handleStudentFetch()
    }, [])

    function DatePickerPopup() {
        return (
            <PopoverContent className="w-[auto] p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        )
    }

    function ClassSelectionCombobox() {
        const frameworks = [
            {
                value: "next.js",
                label: "Next.js",
            },
            {
                value: "sveltekit",
                label: "SvelteKit",
            },
            {
                value: "nuxt.js",
                label: "Nuxt.js",
            },
            {
                value: "remix",
                label: "Remix",
            },
            {
                value: "astro",
                label: "Astro",
            },
        ]
        return (
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Search Class..." />
                    <CommandEmpty>No Class found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    key={framework.label}
                                    value={framework.label}
                                    onSelect={(currentValue) => {
                                        setClassSelectValue(currentValue)
                                        setClassSelectOpen(false)
                                    }}
                                >
                                    <Check className={"mr-2 h-4 w-4" + (classSelectValue === framework.label ? " opacity-100" : " opacity-0")} />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        )
    }

    const UserRow = (studentInfo) => {
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
            <TableRow className="cursor-pointer">
                <TableCell>
                    <div className="flex items-center gap-2">
                        <div>{studentFirstName} {studentLastName}</div>
                    </div>
                </TableCell>
                <TableCell>{studentEmail}</TableCell>
                <TableCell>{studentClasses}</TableCell>
                <TableCell className="text-center"><input type='checkbox' className='w-5 h-5'/></TableCell>
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
        <>
            <Popover open={classSelectOpen} onOpenChange={setClassSelectOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-[250px] mr-2 justify-start text-left font-normal ">
                        <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        {classSelectValue}
                    </Button>
                </PopoverTrigger>
                <ClassSelectionCombobox classSelectValue={classSelectValue} setClassSelectValue={setClassSelectValue} setOpen={setClassSelectOpen} />
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={"w-[280px] ml-2 justify-start text-left font-normal " + (!date && " text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <DatePickerPopup date={date} setDate={setDate} />
            </Popover>
            <Card className="mt-4">
                {students.length > 0 ? (
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Classes Left</TableHead>
                                    <TableHead className="text-center">Attendance</TableHead>
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
                    <CardContent className="p-8 text-gray-500">Please add students to your class to view them here</CardContent>
                ))}
            </Card>
            <div className='flex ml-auto justify-end'>
                <Button className="mt-4">Save Attendance</Button>
            </div>
        </>
    )
}

export default MarkAttendance