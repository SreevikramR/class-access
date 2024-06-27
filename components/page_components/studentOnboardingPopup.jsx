"use client"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CircleArrowRight, Phone, CheckCircle } from "lucide-react"
import { useState } from "react"
import {getPhoneData, PhoneInput} from "../ui/phoneInputComponents"
import { supabaseClient } from "@/components/util_function/supabaseCilent"
import { toast } from "@/components/ui/use-toast"
import equals from "validator/es/lib/equals";

export default function StudentOnboardingPopup({ isOpen, setIsOpen }) {
    const [step, setStep] = useState(0)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleComplete = async () => {
    if (password !== confirmPassword) {
        toast("Passwords do not match");
        return;
    }

    try {
        // Ensure only plain data is being passed
        const studentData = {
            first_name: firstName,
            last_name: lastName,
            details_added:true
        };

        const { data, error } = await supabaseClient
            .from('students')
            .update([studentData])
            .eq('id',(await supabaseClient.auth.getUser()).data.user.id)
        const { data1, error2 } = await supabaseClient.auth.updateUser({
  password: password
})
        if (error) throw error;
        if (error2) throw error2

        toast({
            className: "bg-green-500 border-black border-2",
            title: "Done",
            description: "The new student has been added to your class",
            duration: 3000,
        });
        setIsOpen(false);
    } catch (error) {
        console.error("Error saving student data:", error);
        toast({
            variant: 'destructive',
            title: "Failed to save",
            description: "Try again.",
            duration: 3000,
        });
    }
};
    const _nameAndPassword = () => (
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
                    <Input
                        id="first-name"
                        placeholder="Enter your first name"
                        className="col-span-3"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                    <Label htmlFor="last-name" className="text-right">
                        Last Name
                    </Label>
                    <Input
                        id="last-name"
                        placeholder="Enter your last name"
                        className="col-span-3"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" className="gap-2" onClick={() => { setStep(1) }}>Next<CircleArrowRight className="h-5 w-5" /></Button>
            </DialogFooter>
        </div>
    )

    const _phoneAndJoin = () => (
        <div>
            <DialogHeader>
                <DialogTitle>Welcome!</DialogTitle>
                <DialogDescription>Please Confirm your phone number</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <PhoneInput value={phone} onChange={(value) => setPhone(value)} />
            </div>

            <div className="mb-10">
                <div className="text-sm mt-4 mb-2 text-muted-foreground">Please enter a new password for your account</div>
                <div className="grid items-center grid-cols-4 gap-4 mb-4">
                    <Label htmlFor="password" className="text-center">
                        Password
                    </Label>
                    <Input
                        id="password"
                        placeholder="Create a New Password"
                        className="col-span-3"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="grid items-center grid-cols-4 gap-4">
                    <Label htmlFor="confirm-password" className="text-center">
                        Re-enter Password
                    </Label>
                    <Input
                        id="confirm-password"
                        placeholder="Re-enter Password"
                        className="col-span-3"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>

            <DialogFooter>
                <div className='flex justify-between flex-wrap w-full'>
                    <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setStep(0)}>Back</Button>
                    <Button type="button" className="gap-2" onClick={handleComplete}>Complete<CheckCircle className="h-5 w-5" /></Button>
                </div>
            </DialogFooter>
        </div>
    )

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                {step === 0 && _nameAndPassword()}
                {step === 1 && _phoneAndJoin()}
            </DialogContent>
        </Dialog>
    )
}
