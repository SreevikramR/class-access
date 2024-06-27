"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { AvatarFallback, Avatar } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { CircleArrowRight } from "lucide-react"
import Header from "@/components/page_components/header"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"
import { Copy } from "lucide-react"
import { useState } from "react"
import { UserPlusIcon } from "lucide-react"
import { UserIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ManagePage() {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [numClasses, setNumClasses] = useState(0)
    const [notes, setNotes] = useState("")
    const [isCreatingUser, setIsCreatingUser] = useState(false)
    const [selectedStudents, setSelectedStudents] = useState([])

    const { toast } = useToast()

    const handleNewStudentSubmit = async () => {
        setIsCreatingUser(true)
        // Add new student to the database
        setIsOpen(false)
        setIsCreatingUser(false)
    }

    const _newOrExisting = () => {
        return (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center gap-4 p-6 border-r">
                        <UserPlusIcon className="w-8 h-8 text-primary" />
                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-medium">Add Existing Student</h3>
                            <p className="text-muted-foreground">Add a student that already exists in the system.</p>
                        </div>
                        <Button variant="outline">Add Existing Student</Button>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 p-6">
                        <UserIcon className="w-8 h-8 text-primary" />
                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-medium">Create New Student</h3>
                            <p className="text-muted-foreground">Create a new student profile in the system.</p>
                        </div>
                        <Button variant="outline">Create New Student</Button>
                    </div>
                </div>
            </>
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

    const _existingStudent = () => {
        // Assume you have a list of students, if not, you'll need to fetch this data
        const students = [
            { id: 1, name: "Jane Smith", email: "jane.smith@example.com", initials: "JS" },
            { id: 2, name: "John Doe", email: "john.doe@example.com", initials: "JD" },
            { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com", initials: "AJ" },
        ];// we will replace this from the databse just for testing changed tile code

        return (
            <>
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Select the students you would like to add to your class<br />You will be able to add more students later.</DialogDescription>
                </DialogHeader>
                <div className='pt-3'>
                    <Label htmlFor="searchStudents">Search Students</Label>
                    <Input id="searchStudents" placeholder="Enter student name or email" />
                </div>

                <div className="bg-muted border-2 rounded-md p-4 my-4 max-h-[40vh] overflow-y-auto grid gap-2">
                    {students.map(student => _studentTileForStudentList(student))}
                </div>

                <DialogFooter>
                    <div className='flex justify-between flex-wrap w-full'>
                        <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => setClassCreationStep(2)}>Back</Button>
                        <Button type="button" onClick={() => {
                            if (selectedStudents.length === 0) {
                                toast({
                                    title: 'Alert',
                                    description: 'At least one student must be selected.',
                                    variant: "destructive"
                                })
                                return
                            }
                            setClassCreationStep(4);
                        }} className="gap-2">Verify<CircleArrowRight className="h-5 w-5" /></Button>
                    </div>
                </DialogFooter>
            </>
        )
    }

    const _newStudent = () => {
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numClasses">Classes Balance</Label>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline"
                                onClick={() => setNumClasses(Math.max(0, numClasses - 1))}>
                                -
                            </Button>
                            <Input
                                id="numClasses"
                                type="number"
                                value={numClasses}
                                onChange={(e) => setNumClasses(Number(e.target.value))}
                                min={0}
                                className="w-16 text-center"
                            />
                            <Button type="button" variant="outline"
                                onClick={() => setNumClasses(numClasses + 1)}>
                                +
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={handleNewStudentSubmit}
                            className={`${isCreatingUser ? "cursor-progress" : ""}`}>Submit</Button>
                        <div>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        </div>
                    </DialogFooter>
                </form>
            </>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header/>
            <main className="p-6 space-y-8">
                <Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen>
                    <DialogContent className="sm:max-w-[425px] md:max-w-[45vw]">
                        {/* <_existingStudent /> */}
                        <_newOrExisting />
                        {/* <_newStudent /> */}
                    </DialogContent>
                </Dialog>
                <div className="w-full grid grid-cols-2">
                    <section className="space-y-1">
                        <h1 className="text-3xl font-bold">Class Name</h1>
                        <p className="font-medium pt-4">Wednesdays at 10am</p>
                        <p className="text-gray-600">Class Description</p>
                    </section>
                    <section className="space-y-1 bg-background border-2 p-2 rounded-lg justify-center flex flex-col">
                        <p className="text-gray-600">Please Share the class link with your students</p>
                        <p className="font-medium flex flex-row">Class Link: <span className="font-normal pl-1">classaccess.vercel.app/join?code=ABC123</span><Copy className="ml-2 h-5 w-5 align-middle"/></p>
                    </section>
                </div>
                <section>
                    <div className="flex items-center justify-between my-2">
                        <h2 className="text-2xl font-semibold px-2">My Students (5)</h2>
                        <Button size="sm" className="h-7 gap-1" onClick={() => setIsOpen(true)}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap" >
                                Add Students
                            </span>
                        </Button>
                    </div>
                    <div className="mt-4 overflow-x-auto bg-background rounded-lg border p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Classes Left</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Sam Williams</TableCell>
                                    <TableCell>samwilliams@gmail.com</TableCell>
                                    <TableCell>3</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Alexa Thompson</TableCell>
                                    <TableCell>alexathompson@gmail.com</TableCell>
                                    <TableCell>4</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Mason Johnson</TableCell>
                                    <TableCell>masonjohnson@gmail.com</TableCell>
                                    <TableCell>5</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Ava Davis</TableCell>
                                    <TableCell>avadavis@gmail.com</TableCell>
                                    <TableCell>1</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Ethan Martinez</TableCell>
                                    <TableCell>ethanmartinez@gmail.com</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </section>
            </main>
        </div>
    )
}