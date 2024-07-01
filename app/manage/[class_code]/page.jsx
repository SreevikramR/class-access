'use client'
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/components/util_function/supabaseCilent';
import { useToast } from "@/components/ui/use-toast";
import { Copy, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Header from "@/components/page_components/header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ManageClass({ params }) {
    const [isOpen, setIsOpen] = useState(false);
    const [classData, setClassData] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const { toast } = useToast();
    const router = useRouter();
    const classCode = params.class_code;

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
            }
        }

        if (classCode) {
            fetchClassData();
        }
    }, [classCode, toast]);

    console.log("class", classData);
    console.log("Student", studentData);

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="p-6 space-y-8">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="sm:max-w-[425px] md:max-w-[45vw]">
                        {/* Dialog content */}
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
                            Class Link: <span className="font-normal pl-1">classaccess.vercel.app/join?code={classCode}</span>
                            <Copy className="ml-2 h-5 w-5 align-middle"/>
                        </p>
                    </section>
                </div>
                <section>
                    <div className="flex items-center justify-between my-2">
                        <h2 className="text-2xl font-semibold px-2">My Students</h2>
                        <Button size="sm" className="h-7 gap-1" onClick={() => setIsOpen(true)}>
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
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentData.length > 0 ? studentData.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.first_name} {student.last_name}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{student.classes_left}</TableCell>
                                        <TableCell>
                                            {/* Add actions here */}
                                        </TableCell>
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
    );
}
