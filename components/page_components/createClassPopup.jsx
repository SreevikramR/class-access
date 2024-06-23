"use client"
import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { CircleArrowRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select'

const CreateClassPopup = ({ isOpen, setIsOpen }) => {
    const [classCreationStep, setClassCreationStep] = useState(0)
    const [className, setClassName] = useState("")
    const [classDescription, setClassDescription] = useState("")
    const [selectedDays, setSelectedDays] = useState([])

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
        return (
            <div>
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Select the days for your new class.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox id="monday" />
                            <Label htmlFor="monday">Monday</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="tuesday" />
                            <Label htmlFor="tuesday">Tuesday</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="wednesday" />
                            <Label htmlFor="wednesday">Wednesday</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="thursday" />
                            <Label htmlFor="thursday">Thursday</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="friday" />
                            <Label htmlFor="friday">Friday</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="saturday" />
                            <Label htmlFor="saturday">Saturday</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="sunday" />
                            <Label htmlFor="sunday">Sunday</Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <div className='flex justify-between flex-wrap w-full'>
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
                            <Input className="w-12 text-center" defaultValue="12" />
                            <span>:</span>
                            <Input className="w-12 text-center" defaultValue="30" />
                            <Select id="ampm">
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
                        <Label htmlFor="startTime" className="pt-4 pb-2">Finish Time</Label>
                        <div className="flex items-center gap-1">
                            <Input className="w-12 text-center" defaultValue="12" />
                            <span>:</span>
                            <Input className="w-12 text-center" defaultValue="30" />
                            <Select id="ampm">
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
                    <DialogDescription>Select the students you would like to add to your class</DialogDescription>
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen>
            <DialogContent className="sm:max-w-[425px] lg:max-w-[30vw]">
                {classCreationStep === 0 && _classNameAndDescription()}
                {classCreationStep === 1 && _classDays()}
                {classCreationStep === 2 && _classTimings()}
                {classCreationStep === 3 && _studentList()}
            </DialogContent>
        </Dialog>
    )
}

export default CreateClassPopup