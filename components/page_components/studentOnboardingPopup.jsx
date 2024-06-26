"use client"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CircleArrowRight, Phone } from "lucide-react"
import { useState } from "react"
import { PhoneInputComponent } from "../ui/phoneInput"

export default function StudentOnboardingPopup({ isOpen, setIsOpen }) {

    const [value, setValue] = useState()

    const _nameAndPassword = () => {
        return (
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome!</DialogTitle>
                    <DialogDescription>Please enter your details to join your class</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="first-name" className="text-right">
                            First Name
                        </Label>
                        <Input id="first-name" placeholder="Enter your first name" className="col-span-3" />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="last-name" className="text-right">
                            Last Name
                        </Label>
                        <Input id="last-name" placeholder="Enter your last name" className="col-span-3" />
                    </div>
                    <div className="text-sm mt-4">Please enter a new password for your account</div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="first-name" className="text-right">
                            Password
                        </Label>
                        <Input id="first-name" placeholder="Create a New Password" className="col-span-3" />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="last-name" className="text-right">
                            Re-enter Password
                        </Label>
                        <Input id="last-name" placeholder="Re-enter Password" className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" className="gap-2">Next<CircleArrowRight className="h-5 w-5" /></Button>
                </DialogFooter>
            </DialogContent>
        )
    }

    const _phoneAndJoin = () => {
        return (
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Welcome!</DialogTitle>
                    <DialogDescription>Please enter your details to join your class</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                </div>
                <DialogFooter>
                    <Button type="button" className="gap-2">Next<CircleArrowRight className="h-5 w-5" /></Button>
                </DialogFooter>
            </DialogContent>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Open Welcome Modal</Button>
            </DialogTrigger>
            <_nameAndPassword />
            <PhoneInputComponent />
        </Dialog>
    )
}