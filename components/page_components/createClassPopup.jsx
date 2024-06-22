"use client"
import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { CircleArrowRight } from 'lucide-react'

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
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="Name">Name</Label>
                        <Input id="name" type="name" value={className} placeholder="Class Name" onChange={(e) => setClassName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
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
                        <Button type="button" onClick={() => setClassCreationStep(2)} className="gap-2">Pick Timings<CircleArrowRight className="h-5 w-5" /></Button>
                    </div>
                </DialogFooter>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen>
            <DialogContent className="sm:max-w-[425px]">
                {classCreationStep === 0 && _classNameAndDescription()}
                {classCreationStep === 1 && _classDays()}
            </DialogContent>
        </Dialog>
    )
}

export default CreateClassPopup