"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StudentOnboardingPopup from "@/components/page_components/studentOnboardingPopup"
import { useState } from "react"

export default function Component() {
    const [isOpen, setIsOpen] = useState(false)
    const [value, setValue] = useState()

    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <StudentOnboardingPopup isOpen={isOpen} setIsOpen={setIsOpen} />
            <Card className="w-full max-w-md p-6 space-y-4">
                <div className="flex flex-col items-center space-y-2">
                    <div className="inline-block rounded-lg px-3 py-1 text-sm font-medium">
                        You&#39;ve been invited to join
                    </div>
                    <h2 className="text-2xl font-bold">Introduction to Web Development</h2>
                    <p className="text-muted-foreground">Taught by John Doe</p>
                    <p className="text-muted-foreground">Tuesdays and Thursdays, 7pm - 9pm</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="w-full">
                        Decline
                    </Button>
                    <Button className="w-full" onClick={() => setIsOpen(true)}>Join Class</Button>
                </div>
            </Card>
        </main>
    )
}