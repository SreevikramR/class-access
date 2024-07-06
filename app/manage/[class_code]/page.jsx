'use client'
import { useEffect, useState } from "react";
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import { useToast } from "@/components/ui/use-toast";
import { Copy, PlusCircle, UserPlusIcon, UserIcon, CircleArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/page_components/header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import fetchTimeout from "@/components/util_function/fetch";
import AuthWrapper from "@/components/page_components/authWrapper";

export default function ManageClass({ params }) {
    const [isOpenManage, setIsOpenManage] = useState(false);
    const [classData, setClassData] = useState(null);
    const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [studentData, setStudentData] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [email, setEmail] = useState("");
    const [numClasses, setNumClasses] = useState(0);
    const [notes, setNotes] = useState("");
    const [students, setStudents] = useState([]);
    const { toast } = useToast();
    const classCode = params.class_code;

    useEffect(() => {
        fetchStudents();
    }, []);
async function fetchStudentData(studentUUIDs) {
    if (studentUUIDs && studentUUIDs.length > 0) {
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .in('id', studentUUIDs);

        if (error) {
            console.error('Error fetching students data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load student data. Please try again.',
                variant: "destructive"
            });
        } else {
            setStudentData(data);
        }
    } else {
        setStudentData([]);
    }
}
    useEffect(() => {
        async function fetchClassData() {
            console.log('Fetching class with code:', classCode);
            const { data, error } = await supabaseClient
                .from('classes')
                .select()
                .eq('class_code', classCode);

            if (error) {
                console.error('Error fetching class data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load class data. Please try again.',
                    variant: "destructive"
                });
            } else {
                setClassData(data[0]);
                fetchStudentData(data[0].students);
            }
        }



        if (classCode) {
            fetchClassData();
        }
    }, [classCode, toast]);

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
            console.log(formattedStudents);
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
const handleAddNewStudent = async () => {
    if (!email) {
        toast({
            title: 'Error',
            description: 'Email is required.',
            variant: "destructive"
        });
        return;
    }

    setIsCreatingUser(true);

    try {
        const controller = new AbortController();
        const { signal } = controller;
        const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
        const response = await fetchTimeout(`/api/users/new_student?email=${email}&notes=${notes}&classes=${numClasses}`, 5500, {
            signal,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'jwt': jwt,
                'access_token': jwt
            },
        });

        if (response.status === 409) {
            toast({
                variant: 'destructive',
                title: "Student already exists",
                description: "The student with this email is already registered.",
                duration: 3000
            });
            setIsCreatingUser(false);
            return;
        }

        if (response.status === 200) {
            const result = await response.json();
            const newStudent = result[0];

            // Update the new student's record with class-specific data
            const { error: updateError } = await supabaseClient
                .from('students')
                .update({
                    class_id: [classData.id],
                    classes_left: { [classData.id]: numClasses.toString() },
                    status: { [classData.id]: 'pending' }
                })
                .eq('id', newStudent.id);

            if (updateError) throw updateError;

            setStudents([...students, newStudent]);

            // Update the class with the new student
            const updatedStudents = [...(classData.students || []), newStudent.id];
            await updateClassStudents(updatedStudents);

            // Update local state
            setClassData({ ...classData, students: updatedStudents });
            await fetchStudentData(updatedStudents);

            toast({
                className: "bg-green-500 border-black border-2",
                title: "Student Added",
                description: "The new student has been added to the class",
                duration: 3000
            });

            setEmail('');
            setNumClasses(0);
            setNotes('');
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

const handleAddExistingStudents = async () => {
    if (selectedStudents.length === 0) {
        toast({
            title: 'Alert',
            description: 'At least one student must be selected.',
            variant: "destructive"
        });
        return;
    }

    try {
        const currentStudents = classData.students || [];
        const newStudents = selectedStudents.filter(id => !currentStudents.includes(id));

        if (newStudents.length === 0) {
            toast({
                title: 'Info',
                description: 'All selected students are already in the class.',
            });
            setIsNewStudentOpen(false);
            setSelectedStudents([]);
            return;
        }

        const updatedStudents = [...currentStudents, ...newStudents];

        // Update each student's record
        for (const studentId of newStudents) {
            const { data: studentData, error: fetchError } = await supabaseClient
                .from('students')
                .select('classes_left, status, class_id')
                .eq('id', studentId)
                .single();

            if (fetchError) throw fetchError;

            let updatedClassesLeft = { ...(studentData.classes_left || {}), [classData.id]: numClasses };
            let updatedStatus = { ...(studentData.status || {}), [classData.id]: 'Pending' };
            let updatedClassId = Array.isArray(studentData.class_id)
                ? [...studentData.class_id, classData.id]
                : [classData.id];

            const { error: updateError } = await supabaseClient
                .from('students')
                .update({
                    class_id: updatedClassId,
                    classes_left: updatedClassesLeft,
                    status: updatedStatus
                })
                .eq('id', studentId);

            if (updateError) throw updateError;
        }

        // Update the class with new students
        await updateClassStudents(updatedStudents);

        // Update local state
        setClassData(prevData => ({ ...prevData, students: updatedStudents }));
        await fetchStudentData(updatedStudents);

        toast({
            title: 'Success',
            description: `${newStudents.length} new student(s) added successfully.`,
        });

        setIsNewStudentOpen(false);
        setSelectedStudents([]);
    } catch (error) {
        console.error('Error adding students:', error);
        toast({
            title: 'Error',
            description: 'Failed to add students. Please try again.',
            variant: "destructive"
        });
    }
};
    const updateClassStudents = async (students) => {
        const { data, error } = await supabaseClient
            .from('classes')
            .update({ students })
            .eq('class_code', classCode);

        if (error) {
            console.error('Error updating class students:', error);
            toast({
                variant: 'destructive',
                title: "Failed to update class students",
                description: "Please try again.",
                duration: 3000
            });
        }
    };

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
                        <Button variant="outline" onClick={() => setStep(2)}>Add Existing Student</Button>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4 p-6">
                        <UserIcon className="w-8 h-8 text-primary" />
                        <div className="space-y-2 text-center">
                            <h3 className="text-lg font-medium">Create New Student</h3>
                            <p className="text-muted-foreground">Create a new student profile in the system.</p>
                        </div>
                        <Button variant="outline" onClick={() => setStep(1)}>Create New Student</Button>
                    </div>
                </div>
            </>
        );
    };

    const StudentDetailsPopUp = (student) => {
        return (
            <>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="name" className="text-right">
                                {student.first_name} {student.last_name}
                            </Label>
                            <div className="col-span-3">Student Name</div>
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="phone" className="text-right">
	                            {student.phone || "No Number available"}
                            </Label>
                            <div className="col-span-3">Phone</div>
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="classes" className="text-right">
	                            {student.classes_left}
                            </Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Button variant="outline" onClick={()=>{}}>
                                    -
                                </Button>
                                <div>3</div>
                                <Button variant="outline" onClick={()=>{}}>
                                    +
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </>
        );
    };

    const _studentTileForStudentList = (student) => {
        const isSelected = selectedStudents.includes(student.id);

        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
        return (
            <>
                <DialogHeader>
                    <DialogTitle>Add Students</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col pr-4'>
                    <div>
                        <Label htmlFor="searchStudents" className="font-normal">Search Students</Label>
                        <Input id="searchStudents" placeholder="Enter student name or email" />
                    </div>

                    <div className="bg-muted border-2 rounded-md p-4 my-4 h-[40vh] max-h-[40vh] overflow-y-auto ">
                        {students.length === 0 && <span className='text-sm'>You have not added any students yet</span>}
                        {students.map(student => _studentTileForStudentList(student))}
                    </div>
                </div>

                <DialogFooter>
                <div className='flex justify-between flex-wrap w-full'>
                    <Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => {setStep(0)}}>Back</Button>
                    <Button type="button" onClick={handleAddExistingStudents} className="gap-2">Add Students<CircleArrowRight className="h-5 w-5" /></Button>
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
                <div className="flex flex-row w-full justify-between">
                    <div>
                        <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                    </div>
                    <Button type="button" onClick={handleAddNewStudent}
                        className={`${isCreatingUser ? "cursor-progress" : ""}`}>Submit</Button>
                </div>
            </DialogFooter>
                </form>
            </>
        )
    }


    return (
        <AuthWrapper>
            <div className="min-h-screen bg-gray-100">
                <Header />
                <main className="p-6 space-y-8">
                    <Dialog open={isOpenManage} onOpenChange={setIsOpenManage}>
                        <StudentDetailsPopUp />
                    </Dialog>
                    <Dialog open={isNewStudentOpen} onOpenChange={setIsNewStudentOpen}>
                        <DialogContent className="max-w-[40vw]">
                            {step === 0 && _newOrExisting()}
                            {step === 1 && _newStudent()}
                            {step === 2 && _existingStudent()}
                        </DialogContent>
                    </Dialog>
                    <div className="w-full grid grid-cols-2">
                        <section className="space-y-1">
                            <h1 className="text-3xl font-bold">{classData ? classData.name : 'Class Name'}</h1>
                            <p className="font-medium pt-4">{classData ? classData.description : 'No description available'}</p>
                        </section>
                        <section className="space-y-1 bg-background border-2 p-2 rounded-lg justify-center flex flex-col">
                            <p className="text-gray-600">Please share the class link with your students</p>
                            <p className="font-medium flex flex-row">
                                Class Link: <span className="font-normal pl-1">classaccess.vercel.app/join/{classCode}</span>
                                <Copy className="ml-2 h-5 w-5 align-middle"/>
                            </p>
                        </section>
                    </div>
                    <section>
                        <div className="flex items-center justify-between my-2">
                            <h2 className="text-2xl font-semibold px-2">My Students</h2>
                            <Button size="sm" className="h-7 gap-1" onClick={() => setIsNewStudentOpen(true)}>
                                <PlusCircle className="h-3.5 w-3.5"/>
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentData.length > 0 ? studentData.map(student => (
                                        <TableRow key={student.id} className="hover:cursor-pointer" onClick={() => setIsOpenManage(true)}>
                                            <TableCell>{student.first_name} {student.last_name}</TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>{student.classes_left[classData.id]}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4}>No students data available yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </main>
            </div>
        </AuthWrapper>
    );
}