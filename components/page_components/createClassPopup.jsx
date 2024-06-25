"use client"
import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { CircleArrowRight, CheckCircle } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select'
import { supabase } from '@/app/api/classes/supabaseClient'

const CreateClassPopup = ({ isOpen, setIsOpen }) => {
    const [classCreationStep, setClassCreationStep] = useState(0)
    const [className, setClassName] = useState("")
    const [classDescription, setClassDescription] = useState("")
    const [selectedDays, setSelectedDays] = useState([])
    const [startTime, setStartTime] = useState({ hour: "12", minute: "00", ampm: "AM" })
    const [endTime, setEndTime] = useState({ hour: "01", minute: "00", ampm: "AM" })
    const [selectedStudents, setSelectedStudents] = useState([])

        const handleCreateClass = async () => {
        const classData = {
            name: className,
            description: classDescription,
            days: selectedDays,
            start_time: `${startTime.hour}:${startTime.minute} ${startTime.ampm}`,
            end_time: `${endTime.hour}:${endTime.minute} ${endTime.ampm}`,
        }
        const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  console.error('Authentication error:', authError)
  // Handle unauthenticated user
  return
}
        try {
            // Insert class data
            const { data: classInsertData, error: classError } = await supabase
                .from('classes')
                .insert([classData])
                .select()

            if (classError) throw classError

            const classId = classInsertData[0].id

            // Insert student enrollments
            const enrollments = selectedStudents.map(studentId => ({
                class_id: classId,
                student_id: studentId
            }))

            const { error: enrollmentError } = await supabase
                .from('class_enrollments')
                .insert(enrollments)

            if (enrollmentError) throw enrollmentError

            console.log("Class created successfully!")
            setIsOpen(false)
            // You might want to add some success notification here
        } catch (error) {
            console.error("Error creating class:", error)
            // You might want to add some error notification here
        }
    }


    const _classNameAndDescription = () => {
        return (
            <div>
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Enter a name and description for your class</DialogDescription>
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
                    <DialogFooter>
                        <div className='flex justify-between flex-wrap w-full'>
                            <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={() => setClassCreationStep(1)} className="gap-2">Pick Days<CircleArrowRight className="h-5 w-5" /></Button>
                        </div>
                    </DialogFooter>
                </form>
            </div>
        )
    }

const _classDays = () => {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
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
                                <Label htmlFor={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</Label>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <div className='flex pt-6 justify-between flex-wrap w-full'>
                        <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setClassCreationStep(0)}>Back</Button>
                        <Button type="button" onClick={() => setClassCreationStep(2)} className="gap-2">Choose Timings<CircleArrowRight className="h-5 w-5" /></Button>
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
                                onChange={(e) => setStartTime({...startTime, hour: e.target.value})}
                            />
                            <span>:</span>
                            <Input
                                className="w-12 text-center"
                                value={startTime.minute}
                                onChange={(e) => setStartTime({...startTime, minute: e.target.value})}
                            />
                            <Select
                                value={startTime.ampm}
                                onValueChange={(value) => setStartTime({...startTime, ampm: value})}
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
                                onChange={(e) => setEndTime({...endTime, hour: e.target.value})}
                            />
                            <span>:</span>
                            <Input
                                className="w-12 text-center"
                                value={endTime.minute}
                                onChange={(e) => setEndTime({...endTime, minute: e.target.value})}
                            />
                            <Select
                                value={endTime.ampm}
                                onValueChange={(value) => setEndTime({...endTime, ampm: value})}
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

    const _studentTileForStudentList = () => {
        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarFallback className="bg-white">JS</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-muted-foreground text-sm">jane.smith@example.com</p>
                    </div>
                </div>
                <Checkbox value="jane.smith@example.com" />
            </div>
        )
    }

    const _studentList = () => {
        return (
            <div>
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Select the students you would like to add to your class<br/>You will be able to add more students later.</DialogDescription>
                </DialogHeader>
                <div className='pt-3'>
                    <Label htmlFor="searchStudents">Search Students</Label>
                    <Input id="searchStudents" placeholder="Enter student name or email" />
                </div>

                <div className="bg-muted border-2 rounded-md p-4 my-4 max-h-[40vh] overflow-y-auto grid gap-2">
                    <_studentTileForStudentList/>
                    <_studentTileForStudentList />
                    <_studentTileForStudentList />
                </div>


                <DialogFooter>
                    <div className='flex justify-between flex-wrap w-full'>
                        <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setClassCreationStep(2)}>Back</Button>
                        <Button type="button" onClick={() => setClassCreationStep(4)} className="gap-2">Verify<CircleArrowRight className="h-5 w-5" /></Button>
                    </div>
                </DialogFooter>
            </div>
        )
    }

    const _reviewDetails = () => {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Confirm Class Details</DialogTitle>
                    <DialogDescription>Review the details of the new class before creating it.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="class-name">Class Name</Label>
                        <div>Yoga for Beginners</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="class-description">Description</Label>
                        <div>An introductory yoga class focused on basic poses and breathing techniques.</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="class-days">Days</Label>
                        <div>Monday, Wednesday, Friday</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="class-time">Time</Label>
                        <div>9:00 AM - 10:30 AM</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="students">Students</Label>
                        <div>12</div>
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
            <DialogContent className="sm:max-w-[425px] lg:max-w-[32vw]">
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