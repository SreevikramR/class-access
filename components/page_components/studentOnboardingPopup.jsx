"use client"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CircleArrowRight, Phone } from "lucide-react"
import { useState } from "react"
import { CheckCircle } from "lucide-react"
import { PhoneInput } from "../ui/phoneInputComponents"

export default function StudentOnboardingPopup({ isOpen, setIsOpen }) {

    const [step, setStep] = useState(0)

    const _nameAndPassword = () => {
        return (
            <div>
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
                    


                </div>
                <DialogFooter>
                    <Button type="button" className="gap-2" onClick={() => {setStep(1)}}>Next<CircleArrowRight className="h-5 w-5" /></Button>
                </DialogFooter>
            </div>
        )
    }

    const _phoneAndJoin = () => {
        return (
            <div>
                <DialogHeader>
                    <DialogTitle>Welcome!</DialogTitle>
                    <DialogDescription>Please Confirm your phone number</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <PhoneInput />
                </div>

                <div className="mb-10">
                    <div className="text-sm mt-4 mb-2 text-muted-foreground">Please enter a new password for your account</div>
                    <div className="grid items-center grid-cols-4 gap-4 mb-4">
                        <Label htmlFor="first-name" className="text-center">
                            Password
                        </Label>
                        <Input id="first-name" placeholder="Create a New Password" className="col-span-3" />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="last-name" className="text-center">
                            Re-enter Password
                        </Label>
                        <Input id="last-name" placeholder="Re-enter Password" className="col-span-3" />
                    </div>
                </div>


                <DialogFooter>
                    <div className='flex justify-between flex-wrap w-full'>
                        <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setStep(0)}>Back</Button>
                        <Button type="button" className="gap-2">Complete<CheckCircle className="h-5 w-5" /></Button>
                    </div>
                </DialogFooter>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                {step == 0 && <_nameAndPassword />}
                {step == 1 && <_phoneAndJoin />}
            </DialogContent>
        </Dialog>
    )
}