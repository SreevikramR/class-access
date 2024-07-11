"use client"
import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CircleArrowRight, CheckCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { supabaseClient } from '@/components/util_function/supabaseCilent'
import { useToast } from "@/components/ui/use-toast";
import fetchTimeout from "@/components/util_function/fetch";
// import createZoomMeeting from '@/components/util_function/createZoomMeeting'

const CreateClassPopup = ({ isOpen, setIsOpen }) => {
    const [classCreationStep, setClassCreationStep] = useState(0)
    const [className, setClassName] = useState("")
    const [classDescription, setClassDescription] = useState("")
    const [selectedDays, setSelectedDays] = useState([])
    const [startTime, setStartTime] = useState({ hour: "12", minute: "00", ampm: "AM" })
    const [endTime, setEndTime] = useState({ hour: "01", minute: "00", ampm: "AM" })
    const [selectedStudents, setSelectedStudents] = useState([])
    const [error, setError] = useState('')
    const { toast } = useToast()
    const [students, setStudents] = useState([])
    const [newStudentEmail, setNewStudentEmail] = useState('')
    const [newStudentNotes, setNewStudentNotes] = useState('')
    const [zoomLink, setZoomLink] = useState("")

    const resetAllStates = () => {
        setClassName("")
        setClassDescription("")
        setSelectedDays([])
        setStartTime({ hour: "12", minute: "00", ampm: "AM" })
        setEndTime({ hour: "01", minute: "00", ampm: "AM" })
        setSelectedStudents([])
        setNewStudentEmail('')
        setNewStudentNotes('')
        setZoomLink('')
        setClassCreationStep(0)
    }

    const generateRandomString = (length) => {
        const getRandomCharacter = () => {
            const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
            return characters[Math.floor(Math.random() * characters.length)];
        }
        let result = '';
        for (let i = 0; i < length; i++) {
            result += getRandomCharacter();
        }
        return result;
    }

    const handleCreateClass = async () => {
        const code = generateRandomString(6)
        // const classLink = await createZoomMeeting();
        // console.log(classLink)
        // if (zoomLink === "ERROR") {
        //     console.error("Error creating Zoom meeting");
        //     toast({
        //         variant: 'destructive',
        //         title: "Failed to create class",
        //         description: "Try again.",
        //         duration: 3000
        //     });
        //     return;
        // }

        const classData = {
            name: className,
            description: classDescription,
            days: selectedDays,
            teacher_id: (await supabaseClient.auth.getUser()).data.user.id,
            start_time: `${startTime.hour}:${startTime.minute} ${startTime.ampm}`,
            end_time: `${endTime.hour}:${endTime.minute} ${endTime.ampm}`,
            students: selectedStudents,
            class_code: code,
            zoom_link: zoomLink,
        };

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) {
            console.error('Authentication error:', authError);
            return;
        }

        try {
            // Insert class data
            console.log(selectedStudents)
            const { data: classInsertData, error: classError } = await supabaseClient
                .from('classes')
                .insert([classData])
                .select('id');

            const uuid = classInsertData[0].id

            if (classError) throw classError;
            const { data: teacherData, error: teacherError } = await supabaseClient.from('teachers').select("first_name, last_name").eq('id', (await supabaseClient.auth.getUser()).data.user.id).single();
            console.log(uuid);
            if (error) throw error
            let updatedUuidArray;
            if (classInsertData.class_id && Array.isArray(classInsertData.class_id)) {
                updatedUuidArray = [...classInsertData.class_id, uuid];
            } else {
                updatedUuidArray = [uuid];
            }
            let studentEmails = [];
            for (const student of selectedStudents) {
                console.log(student)
                const { data: studentData, error: fetchError } = await supabaseClient
                    .from('students')
                    .select('class_id, classes_left, status, teachers, email')
                    .eq('id', student)
                    .single();

                if (fetchError) throw fetchError;
                studentEmails.push(studentData.email)

                // Update class_id array
                let updatedClassId = Array.isArray(studentData.class_id)
                    ? [...studentData.class_id, uuid]
                    : [uuid];

                // Update classes_left object
                let updatedClassesLeft = {
                    ...(studentData.classes_left || {}),
                    [uuid]: '0'
                };

                // Update status object
                let updatedStatus = {
                    ...(studentData.status || {}),
                    [uuid]: 'Invited'
                };
                let updatedteacher = Array.isArray(studentData.teachers)
                    ? [...studentData.teachers, (await supabaseClient.auth.getUser()).data.user.id]
                    : [(await supabaseClient.auth.getUser()).data.user.id];

                const { data: updateData, error: updateError } = await supabaseClient
                    .from('students')
                    .update({
                        class_id: updatedClassId,
                        classes_left: updatedClassesLeft,
                        status: updatedStatus,
                        teachers: updatedteacher
                    })
                    .eq('id', student)
                if (updateError) throw updateError;
            }
            const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
            const response = await fetchTimeout(`/api/email/onboard_student`, 5500, { method: 'POST', headers: { "student_email": studentEmails, "class_name": className, "class_code": code, "teacher_name": `${teacherData.first_name} ${teacherData.last_name}`, "jwt": jwt } });
            console.log(response)
            console.log("Class created successfully and students updated!");
            toast({
                className: "bg-green-500 border-black border-2",
                title: "Class Successfully Added",
                description: "The new class has been added and students have been updated",
                duration: 3000
            });
            resetAllStates()
            setIsOpen(false);
        } catch (error) {
            setIsOpen(false);
            console.error("Error creating class or updating students:", error);
            toast({
                variant: 'destructive',
                title: "Failed to create class or update students",
                description: "Try again.",
                duration: 3000
            });
        }
    };

    const _classNameAndDescription = () => {
        return (
            <div>
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Enter a name, description, and Zoom link for your class</DialogDescription>
                </DialogHeader>
                <form className="space-y-4 pt-3">
                    <div>
                        <Label htmlFor="Name">Name</Label>
                        <Input id="name" type="name" value={className} placeholder="Class Name" onChange={(e) => setClassName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={classDescription} onChange={(e) => setClassDescription(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="zoomLink">Zoom Link</Label>
                        <Input id="zoomLink" type="url" value={zoomLink} placeholder="https://zoom.us/j/example" onChange={(e) => setZoomLink(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <div className='flex justify-between flex-wrap w-full'>
                            <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={() => {
                                if (!className) {
                                    // setError('Class name is required.');
                                    toast({ title: 'Incomplete Fields', description: 'Class name is required.', variant: "destructive", })
                                    return
                                }
                                setClassCreationStep(1);
                            }} className="gap-2">Pick Days<CircleArrowRight className="h-5 w-5" /></Button>
                        </div>
                    </DialogFooter>
                </form>

            </div>
        )
    }

    const _classDays = () => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        return (
            <div>
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Select the days for your new class.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 pt-8 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        {days.map(day => (
                            <div key={day} className="flex items-center gap-2">
                                <Checkbox
                                    id={day}
                                    checked={selectedDays.includes(day)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedDays([...selectedDays, day])
                                        } else {
                                            setSelectedDays(selectedDays.filter(d => d !== day))
                                        }
                                    }}
                                />
                                <Label htmlFor={day}>{day}</Label>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <div className='flex pt-6 justify-between flex-wrap w-full'>
                        <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setClassCreationStep(0)}>Back</Button>
                        <Button type="button" onClick={() => {
                            if (selectedDays.length === 0) {

                                toast({ title: 'Incomplete Fields', description: 'Please select at least one day', variant: "destructive" })
                                return
                            }

                            setClassCreationStep(2);
                        }} className="gap-2">Choose Timings<CircleArrowRight className="h-5 w-5" /></Button>
                    </div>
                </DialogFooter>

            </div>
        )
    }

    const _classTimings = () => {
        return (
            <div className='flex w-full flex-col'>
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Pick the timing for your class</DialogDescription>
                </DialogHeader>

                <div className="flex w-full flex-row items-center justify-between">
                    <div className='flex flex-col'>
                        <Label htmlFor="startTime" className="pt-4 pb-2">Start Time</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                className="w-12 text-center"
                                value={startTime.hour}
                                onChange={(e) => setStartTime({ ...startTime, hour: e.target.value })}
                            />
                            <span>:</span>
                            <Input
                                className="w-12 text-center"
                                value={startTime.minute}
                                onChange={(e) => setStartTime({ ...startTime, minute: e.target.value })}
                            />
                            <Select
                                value={startTime.ampm}
                                onValueChange={(value) => setStartTime({ ...startTime, ampm: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="AM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <Label htmlFor="endTime" className="pt-4 pb-2">Finish Time</Label>
                        <div className="flex items-center gap-1">
                            <Input
                                className="w-12 text-center"
                                value={endTime.hour}
                                onChange={(e) => setEndTime({ ...endTime, hour: e.target.value })}
                            />
                            <span>:</span>
                            <Input
                                className="w-12 text-center"
                                value={endTime.minute}
                                onChange={(e) => setEndTime({ ...endTime, minute: e.target.value })}
                            />
                            <Select
                                value={endTime.ampm}
                                onValueChange={(value) => setEndTime({ ...endTime, ampm: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="AM" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <div className='flex justify-between flex-wrap w-full pt-6'>
                        <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setClassCreationStep(1)}>Back</Button>
                        <Button type="button" onClick={() => setClassCreationStep(3)} className="gap-2">Add Students<CircleArrowRight className="h-5 w-5" /></Button>
                    </div>
                </DialogFooter>
            </div>
        )
    }

    const _studentTileForStudentList = (student) => {
        const isSelected = selectedStudents.includes(student.id);

        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback className="bg-white">{student.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-muted-foreground text-sm">{student.email}</p>
                    </div>
                </div>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        }
                    }}
                />
            </div>
        )
    }

    const handleAddStudent = async () => {
        if (!newStudentEmail) {
            toast({ title: 'Incomplete Fields', description: 'Student email is required.', variant: "destructive", });
            return;
        }
        try {
            const controller = new AbortController()
            const { signal } = controller;
            const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
            const { data: teacherData, error: teacherError } = await supabaseClient.from('teachers').select("first_name, last_name").eq('id', (await supabaseClient.auth.getUser()).data.user.id).single();
            const response = await fetchTimeout(`/api/users/new_student?email=${newStudentEmail}&notes=${newStudentNotes}&teacher_fname=${teacherData.first_name}&teacher_lname=${teacherData.last_name}`, 5500, {
                signal,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'jwt': jwt,
                    'refresh_token': (await supabaseClient.auth.getSession()).data.session.refresh_token
                },
            });

            if (response.status === 409) {
                toast({
                    variant: 'destructive',
                    title: "Student already exists",
                    description: "The student with this email is already registered.",
                    duration: 3000
                });
                return;
            }

            const result = await response.json();

            if (response.status === 200) {
                const newStudent = result[0];
                setStudents([...students, newStudent]);
                setSelectedStudents([...selectedStudents, newStudent.id]);
                setNewStudentEmail('');
                setNewStudentNotes('');

                toast({
                    className: "bg-green-500 border-black border-2",
                    title: "Student Added",
                    description: "The new student has been added and selected",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error("Error adding student:", error);
            toast({
                variant: 'destructive',
                title: "Failed to add student",
                description: "Try again.",
                duration: 3000
            });
        }
    };

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabaseClient
                .from('students')
                .select('*')
                .contains('teachers', `{${(await supabaseClient.auth.getUser()).data.user.id}}`);

            if (error) throw error;

            // Transform the data to match the expected format
            const formattedStudents = data.map(student => ({
                id: student.id,
                name: student.first_name + ' ' + student.last_name,
                email: student.email,

            }));

            setStudents(formattedStudents);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast({
                variant: 'destructive',
                title: "Failed to fetch students",
                description: "Please try again.",
                duration: 3000
            });
        }
    };

    useEffect(() => {
        if (classCreationStep === 3) {
            const fetchStudentsData = async () => {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (user) {
                    await fetchStudents(user.id);
                } else {
                    console.error('No authenticated user found');
                    toast({
                        variant: 'destructive',
                        title: "Authentication Error",
                        description: "Please login again.",
                        duration: 3000
                    });
                }
            };
            fetchStudentsData();
        }
    }, [classCreationStep]);

    const _studentList = () => {
        return (
            <div>
                <DialogHeader>
                    <DialogTitle className="text-center">Create Class</DialogTitle>
                    <DialogDescription className="text-center">Select the students you would like to add to your class<br />You will be able to add more students later.</DialogDescription>
                </DialogHeader>
                <div className='flex w-full flex-row mt-6'>
                    <div className='flex flex-col w-1/2 pr-4 border-r-2'>
                        <div className='text-center font-semibold mb-2'>Existing Student</div>
                        <div>
                            <Label htmlFor="searchStudents" className="font-normal">Search Students</Label>
                            <Input id="searchStudents" placeholder="Enter student name or email" />
                        </div>

                        <div className="bg-muted border-2 rounded-md p-4 my-4 h-[40vh] max-h-[40vh] overflow-y-auto grid gap-2">
                            {students.length === 0 && <span className='text-sm'>You have not added any students yet</span>}
                            {students.map(student => _studentTileForStudentList(student))}
                        </div>
                    </div>
                    <div className='flex flex-col w-1/2 pl-4 justify-center'>
                        <div className='text-center font-semibold mb-2'>New Student</div>
                        <div>
                            <Label htmlFor="email" className="font-normal">Email</Label>
                            <Input
                                id="student-email"
                                type="email"
                                value={newStudentEmail}
                                onChange={(e) => setNewStudentEmail(e.target.value)}
                                placeholder="Student Email"
                                required
                            />
                        </div>
                        <div className='mt-2'>
                            <Label htmlFor="email" className="font-normal">Notes</Label>
                            <Textarea
                                id="student-notes"
                                value={newStudentNotes}
                                onChange={(e) => setNewStudentNotes(e.target.value)}
                                placeholder="Additional Notes"
                            />
                        </div>
                        <div className='mt-4 w-full'>
                            <Button type="button" onClick={handleAddStudent} className="gap-2">Add Student<CircleArrowRight className="h-5 w-5" /></Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <div className='flex justify-between flex-wrap w-full'>
                        <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setClassCreationStep(2)}>Back</Button>
                        <Button type="button" onClick={() => {
                            setClassCreationStep(4);
                        }} className="gap-2">Verify<CircleArrowRight className="h-5 w-5" /></Button>
                    </div>
                </DialogFooter>
            </div>
        )
    }

    const _reviewDetails = () => {
        const classData = {
            name: className,
            description: classDescription,
            days: selectedDays,
            startTime: `${startTime.hour}:${startTime.minute} ${startTime.ampm}`,
            endTime: `${endTime.hour}:${endTime.minute} ${endTime.ampm}`,
            capacity: selectedStudents.length,
            zoomLink: zoomLink, // Add this line
        };

        return (
            <>
                <DialogHeader>
                    <DialogTitle>Confirm Class Details</DialogTitle>
                    <DialogDescription>Review the details of the new class before creating it.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="class-name">Class Name</Label>
                        <div>{classData.name}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="zoom-link">Zoom Link</Label>
                        <div>{classData.zoomLink}</div>
                    </div>
                    {classDescription &&
                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                            <Label htmlFor="class-description">Description</Label>
                            <div>{classData.description}</div>
                        </div>
                    }

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="class-days">Days</Label>
                        <div>{classData.days.join(", ")}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="class-time">Time</Label>
                        <div>{`${classData.startTime} - ${classData.endTime}`}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="students">Students</Label>
                        <div>{classData.capacity}</div>
                    </div>
                </div>
                <DialogFooter>
                    <div className='flex justify-between flex-wrap w-full'>
                        <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setClassCreationStep(3)}>Back</Button>
                        <Button type="button" onClick={handleCreateClass} className="gap-2">Confirm<CheckCircle className="h-5 w-5" /></Button>
                    </div>
                </DialogFooter>
            </>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen>
            <DialogContent className={"sm:max-w-[425px] " + (classCreationStep === 3 ? "lg:max-w-[55vw]" : "lg:max-w-[32vw]")}>
                {classCreationStep === 0 && _classNameAndDescription()}
                {classCreationStep === 1 && _classDays()}
                {classCreationStep === 2 && _classTimings()}
                {classCreationStep === 3 && _studentList()}
                {classCreationStep === 4 && _reviewDetails()}
            </DialogContent>
        </Dialog>
    )
}

export default CreateClassPopup
