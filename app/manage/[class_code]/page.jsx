'use client'
import React, {useEffect, useState} from "react";
import {supabaseClient} from '@/components/util_function/supabaseCilent';
import {useToast} from "@/components/ui/use-toast";
import {CheckCircle, CircleArrowRight, Copy, EditIcon, PlusCircle, UserIcon, UserPlusIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import {Checkbox} from "@/components/ui/checkbox";
import Header from "@/components/page_components/header";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import fetchTimeout from "@/components/util_function/fetch";
import AuthWrapper from "@/components/page_components/authWrapper";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
// I am here
export default function ManageClass({params}) {
	const [isOpenManage, setIsOpenManage] = useState(false);
	const [classData, setClassData] = useState(null);
	const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
	const [step, setStep] = useState(0);
	const [studentData, setStudentData] = useState([]);
	const [selectedStudents, setSelectedStudents] = useState([]);
	const [email, setEmail] = useState("");
	const [numClasses, setNumClasses] = useState(0);
	const [notes, setNotes] = useState("");
	const [students, setStudents] = useState([]);
	const {toast} = useToast();
	const classCode = params.class_code;
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [loading, setLoading] = useState(false);
	const [teacherData, setTeacherData] = useState(null);
	const [isEditClassOpen, setIsEditClassOpen] = useState(false);
	
	
	useEffect(() => {
		fetchTeacherData();
		fetchStudents();
	}, []);
	
	const resetPopupStates = () => {
		setEmail("");
		setNumClasses(0);
		setNotes("");
		setSelectedStudents([]);
	}
	
	useEffect(() => {
		if (classCode) {
			fetchClassData();
		}
	}, [classCode, toast]);
	
	const handleCopyLink = () => {
		const classLink = `classaccess.tech/join/${classCode}`;
		navigator.clipboard.writeText(classLink).then(() => {
			toast({
				title: "Link copied!", description: "The class link has been copied to your clipboard.",
			});
		}).catch(err => {
			console.error('Failed to copy: ', err);
			toast({
				title: "Copy failed", description: "Failed to copy the link. Please try again.", variant: "destructive"
			});
		});
	};
	
	const fetchTeacherData = async () => {
		const {data: {user}} = await supabaseClient.auth.getUser();
		if (user) {
			const {data, error} = await supabaseClient
				.from('teachers')
				.select('*')
				.eq('id', user.id)
				.single();
			if (error) {
				console.error('Error fetching teacher data:', error);
			} else {
				setTeacherData(data);
			}
		}
	};
	
	async function fetchStudentData(studentUUIDs) {
		setLoading(true)
		if (studentUUIDs && studentUUIDs.length > 0) {
			const {data, error} = await supabaseClient
				.from('student_proxies')
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
		setLoading(false)
	}
	
	async function fetchClassData() {
		setLoading(true)
		console.log('Fetching class with code:', classCode);
		const {data, error} = await supabaseClient
			.from('classes')
			.select()
			.eq('class_code', classCode);
		
		if (error) {
			console.error('Error fetching class data:', error);
			toast({
				title: 'Error', description: 'Failed to load class data. Please try again.', variant: "destructive"
			});
		} else {
			setClassData(data[0]);
			fetchStudentData(data[0].student_proxy_ids);
		}
		setLoading(false)
	}
	
	const fetchStudents = async () => {
		setLoading(true)
		try {
			const {data, error} = await supabaseClient
				.from('student_proxies')
				.select('*')
				.eq('teacher_id', (await supabaseClient.auth.getUser()).data.user.id);
			
			if (error) throw error;
			
			// Transform the data to match the expected format
			const formattedStudents = data.map(student => ({
				id: student.id,
				name: (student.first_name && student.last_name) ? student.first_name + ' ' + student.last_name : 'Student Invited',
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
		setLoading(false)
	};
	
	const handleAddNewStudent = async () => {
		if (loading) return;
		if (!email) {
			toast({
				title: 'Error', description: 'Email is required.', variant: "destructive"
			});
			return;
		}
		
		setLoading(true)
		
		
		// Handle students
		const {data: teacherData, error: teacherError} = await supabaseClient
			.from('teachers')
			.select('first_name, last_name')
			.eq('id', classData.teacher_id)
			.single()
		
		if (teacherError) throw teacherError;
		
		const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
		try {
			const headers = {
				"jwt": jwt,
				"teacher_name": `${teacherData.first_name} ${teacherData.last_name}`,
				"email": email,
				"notes": notes || '',
				"classes_left": numClasses,
				"class_id": classData.id,
				"class_code": classCode,
				"class_name": classData.name
			};
			
			console.log('Sending request with headers:', headers);
			
			const response = await fetchTimeout(`/api/students/new_student`, 10000, {
				method: 'POST', headers: headers,
			});
			
			if (response.status !== 200) {
				
				const errorText = await response.text();
				console.error('Error response:', response.status, errorText);
				toast({
					variant: 'destructive',
					title: "Failed to add student to class",
					description: `Error adding ${email}: ${errorText}`,
					duration: 3000
				});
			}
			
			resetPopupStates();
			console.log("Class created successfully and students updated!");
			toast({
				className: "bg-green-500 border-black border-2",
				title: "Student Successfully Added",
				description: "The new class has been added and students have been updated",
				duration: 3000
			});
			
			
		} catch (error) {
			console.error("Error updating students", error);
			toast({
				variant: 'destructive',
				title: "Failed update students",
				description: "Please try again.",
				duration: 3000
			});
		}
	};
	
	const handleAddExistingStudents = async () => {
		if (loading) return;
		if (selectedStudents.length === 0) {
			toast({
				title: 'Alert', description: 'At least one student must be selected.', variant: "destructive"
			});
			return;
		}
		
		setLoading(true);
		try {
			const currentStudents = classData.students || [];
			const newStudents = selectedStudents.filter(student => !currentStudents.includes(student.id));
			
			if (newStudents.length === 0) {
				toast({
					title: 'Info', description: 'All selected students are already in the class.',
				});
				setIsNewStudentOpen(false);
				setSelectedStudents([]);
				setLoading(false);
				return;
			}
			
			const updatedStudents = [...currentStudents, ...newStudents.map(student => student.id)];
			
			const {data: teacherData, error: teacherError} = await supabaseClient
				.from('teachers')
				.select('first_name, last_name')
				.eq('id', classData.teacher_id)
				.single();
			
			if (teacherError) throw teacherError;
			
			const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
			
			let addedAllStudents = true;
			for (const student of newStudents) {
				const headers = {
					"jwt": jwt,
					"teacher_name": `${teacherData.first_name} ${teacherData.last_name}`,
					"email": student.email,
					"notes": student.notes || '',
					"classes_left": "0",
					"class_id": classData.id,
					"class_code": classCode,
					"class_name": classData.name
				};
				
				console.log('Sending request with headers:', headers);
				
				const response = await fetchTimeout(`/api/students/new_student`, 10000, {
					method: 'POST', headers: headers,
				});
				
				if (response.status !== 200) {
					addedAllStudents = false;
					const errorText = await response.text();
					console.error('Error response:', response.status, errorText);
					toast({
						variant: 'destructive',
						title: "Failed to add student to class",
						description: `Error adding ${student.email}: ${errorText}`,
						duration: 3000
					});
				}
			}
			
			// Update local state
			setClassData(prevData => ({...prevData, students: updatedStudents}));
			await fetchStudentData(updatedStudents);
			resetPopupStates();
			toast({
				title: 'Success',
				description: `${newStudents.length} new student(s) added successfully and emails sent.`,
			});
			
			setIsNewStudentOpen(false);
			setSelectedStudents([]);
		} catch (error) {
			console.error('Error adding students:', error);
			toast({
				title: 'Error',
				description: 'Failed to add students or send emails. Please try again.',
				variant: "destructive"
			});
		}
		setLoading(false);
	};
	
	const _newOrExisting = () => {
		return (<>
			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col items-center justify-center gap-4 p-6 border-r">
					<UserPlusIcon className="w-8 h-8 text-primary"/>
					<div className="space-y-2 text-center">
						<h3 className="text-lg font-medium">Add Existing Student</h3>
						<p className="text-muted-foreground">Add a student that already exists in the system.</p>
					</div>
					<Button variant="outline" onClick={() => setStep(2)}>Add Existing Student</Button>
				</div>
				<div className="flex flex-col items-center justify-center gap-4 p-6">
					<UserIcon className="w-8 h-8 text-primary"/>
					<div className="space-y-2 text-center">
						<h3 className="text-lg font-medium">Create New Student</h3>
						<p className="text-muted-foreground">Create a new student profile in the system.</p>
					</div>
					<Button variant="outline" onClick={() => setStep(1)}>Create New Student</Button>
				</div>
			</div>
		</>);
	};
	
	const handleUpdate = async () => {
		await fetchClassData();  // This will refresh both class and student data
	};
	
	function parseTime(timeString) {
		const [time, period] = timeString.split(' ');
		const [hour, minute] = time.split(':');
		return {hour, minute, ampm: period};
	}
	
	const EditClassDialog = ({isOpen, onClose, classData, onUpdate}) => {
		
		const [name, setName] = useState(classData.name);
		const [meetingLink, setMeetingLink] = useState(classData.meeting_link || '');
		const [startTime, setStartTime] = useState(classData.start_time ? parseTime(classData.start_time) : {
			hour: '', minute: '', ampm: 'AM'
		});
		const [endTime, setEndTime] = useState(classData.end_time ? parseTime(classData.end_time) : {
			hour: '', minute: '', ampm: 'AM'
		});
		const [selectedDays, setSelectedDays] = useState(classData.days || []);
		
		const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
		
		const convertTo24HourFormat = (time) => {
			let hour = parseInt(time.hour, 10);
			const minute = time.minute.padStart(2, '0');
			const ampm = time.ampm;
			
			if (ampm === 'PM' && hour < 12) hour += 12;
			if (ampm === 'AM' && hour === 12) hour = 0;
			
			return `${hour.toString().padStart(2, '0')}:${minute}:00`;
		};
		const handleDayChange = (day, checked) => {
			setSelectedDays(prevDays => {
				// Ensure prevDays is an array
				const currentDays = Array.isArray(prevDays) ? prevDays : [];
				
				if (checked) {
					// Add day if checked and not already in the array
					if (!currentDays.includes(day)) {
						return [...currentDays, day];
					}
				} else {
					// Remove day if unchecked
					return currentDays.filter(d => d !== day);
				}
				return currentDays;
			});
		};
		
		
		const handleSubmit = async () => {
			const formattedStartTime = convertTo24HourFormat(startTime);
			const formattedEndTime = convertTo24HourFormat(endTime);
			
			const {data, error} = await supabaseClient
				.from('classes')
				.update({
					name: name,
					meeting_link: meetingLink,
					start_time: formattedStartTime,
					end_time: formattedEndTime,
					days: selectedDays
				})
				.eq('id', classData.id);
			
			if (error) {
				console.error('Error updating class:', error);
				toast({
					variant: 'destructive',
					title: "Failed to update class",
					description: "Please try again.",
					duration: 3000
				});
			} else {
				toast({
					title: 'Success', description: 'Class updated successfully.',
				});
				onUpdate();
				onClose();
			}
		};
		
		return (<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px] lg:max-w-[32vw]">
				<DialogHeader>
					<DialogTitle>Edit Class</DialogTitle>
					<DialogDescription>Modify the details of your class</DialogDescription>
				</DialogHeader>
				<form className="space-y-4 pt-3">
					<div>
						<Label htmlFor="name">Name</Label>
						<Input id="name" type="text" value={name} placeholder="Class Name"
						       onChange={(e) => setName(e.target.value)} required/>
					</div>
					<div>
						<Label htmlFor="meetingLink">Meeting Link</Label>
						<Input id="meetingLink" type="url" value={meetingLink}
						       placeholder="https://zoom.us/j/example"
						       onChange={(e) => setMeetingLink(e.target.value)} required/>
					</div>
					<div>
						<Label>Days</Label>
						<div className="grid grid-cols-2 gap-4 pt-2">
							{days.map(day => (<div key={day} className="flex items-center gap-2">
								<Checkbox
									id={day}
									checked={selectedDays.includes(day)}
									onCheckedChange={(checked) => handleDayChange(day, checked)}
								/>
								<Label htmlFor={day}>{day}</Label>
							</div>))}
						</div>
					</div>
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
										<SelectValue placeholder="AM"/>
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
										<SelectValue placeholder="AM"/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="AM">AM</SelectItem>
										<SelectItem value="PM">PM</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</form>
				<DialogFooter>
					<div className='flex justify-between flex-wrap w-full'>
						<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={onClose}>Cancel</Button>
						<Button type="button" onClick={handleSubmit} className="gap-2">
							Save Changes<CheckCircle className="h-5 w-5"/>
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>);
	};
	
	
	const StudentDetailsPopUp = ({student, classId, onClose, onUpdate}) => {
		const [classes, setClasses] = useState(0);
		const {toast} = useToast();
		
		useEffect(() => {
			if (student && student.classes_left && student.classes_left[classId]) {
				setClasses(parseInt(student.classes_left[classId]));
			}
		}, [student, classId]);
		
		const handleIncrement = () => setClasses(prev => prev + 1);
		const handleDecrement = () => setClasses(prev => Math.max(0, prev - 1));
		useEffect(() => {
			if (student && student.classes_left && typeof student.classes_left === 'object') {
				setClasses(parseInt(student.classes_left[classId] || 0));
			} else {
				setClasses(0);
			}
		}, [student, classId]);
		const handleSave = async () => {
			try {
				console.log("Current student data:", student);
				console.log("Updating classes for classId:", classId);
				console.log("New classes value:", classes);
				
				const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
				const refreshToken = (await supabaseClient.auth.getSession()).data.session.refresh_token;
				//app/api/students/update_classes/route.js
				const response = await fetchTimeout('/api/students/update_classes', 10000, {
					method: 'PUT', headers: {
						'jwt': jwt,
						'student_proxy_id': student.id,
						'class_id': classId,
						'classes_left': classes.toString()
					}
				});
				if (response.status !== 200) {
					const errorText = await response.text();
					console.error('Error response:', response.status, errorText);
					toast({
						variant: 'destructive',
						title: "Failed to update",
						description: `Error adding ${student.email}: ${errorText}`,
						duration: 3000
					});
				}
				
				toast({
					title: "Classes Updated", description: "The class count has been updated successfully.",
				});
				
				// Fetch the updated student data to confirm the change
				const {data: updatedStudent, error: fetchError} = await supabaseClient
					.from('student_proxies')
					.select('*')
					.eq('id', student.id)
					.single();
				
				if (fetchError) {
					console.error("Error fetching updated student data:", fetchError);
				} else {
					console.log("Updated student data:", updatedStudent);
				}
				
				onUpdate();
				onClose();
			} catch (error) {
				console.error("Error updating classes:", error);
				toast({
					variant: 'destructive', title: "Failed to update classes", description: "Please try again.",
				});
			}
		};
		return (<DialogContent className="sm:max-w-[425px]">
			<DialogHeader>
				<DialogTitle>Student Details</DialogTitle>
			</DialogHeader>
			<div className="grid gap-4 py-4">
				<div className="grid items-center grid-cols-4 gap-4">
					<Label htmlFor="name" className="text-right">
						Name
					</Label>
					<div className="col-span-3">{student.first_name} {student.last_name}</div>
				</div>
				<div className="grid items-center grid-cols-4 gap-4">
					<Label htmlFor="email" className="text-right">
						Email
					</Label>
					<div className="col-span-3">{student.email}</div>
				</div>
				<div className="grid items-center grid-cols-4 gap-4">
					<Label htmlFor="classes" className="text-right">
						Classes
					</Label>
					<div className="col-span-3 flex items-center gap-2">
						<Button variant="outline" onClick={handleDecrement}>
							-
						</Button>
						<div>{classes}</div>
						<Button variant="outline" onClick={handleIncrement}>
							+
						</Button>
					</div>
				</div>
			</div>
			<DialogFooter>
				
				<Button type="button" onClick={handleSave}>Save</Button>
			</DialogFooter>
		</DialogContent>);
	};
	
	const _studentTileForStudentList = (student) => {
		const isSelected = selectedStudents.some(s => s.id === student.id);
		
		return (<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<div>
					<p className="font-medium">{student.name}</p>
					<p className="text-muted-foreground text-sm">{student.email}</p>
				</div>
			</div>
			<Checkbox
				checked={isSelected}
				onCheckedChange={(checked) => {
					if (checked) setSelectedStudents([...selectedStudents, {
						id: student.id, email: student.email, name: student.name
					}]); else {
						setSelectedStudents(selectedStudents.filter(id => id !== student.id));
					}
				}}
			/>
		</div>)
	}
	
	const _existingStudent = () => {
		return (<>
			<DialogHeader>
				<DialogTitle>Add Students</DialogTitle>
			</DialogHeader>
			<div className='flex flex-col pr-4'>
				<div className="bg-muted border-2 rounded-md p-4 my-4 h-[40vh] max-h-[40vh] overflow-y-auto ">
					{students.length === 0 && <span className='text-sm'>You have not added any students yet</span>}
					{students.map(student => _studentTileForStudentList(student))}
				</div>
			</div>
			
			<DialogFooter>
				<div className='flex justify-between flex-wrap w-full'>
					<Button className="border-slate-400 hover:border-black" variant="outline" onClick={() => {
						setStep(0)
					}}>Back</Button>
					<Button type="button" onClick={handleAddExistingStudents}
					        className={"gap-2" + (loading ? " cursor-progress" : "")}>Add
						Students<CircleArrowRight className="h-5 w-5"/></Button>
				</div>
			</DialogFooter>
		</>)
	}
	
	const _newStudent = () => {
		return (<>
			<DialogHeader>
				<DialogTitle>Add New Student</DialogTitle>
			</DialogHeader>
			<form className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
					       required/>
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
					<Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}/>
				</div>
				<DialogFooter>
					<div className="flex flex-row w-full justify-between">
						<div>
							<Button variant="outline" onClick={() => setStep(0)}>Back</Button>
						</div>
						<Button type="button" className={(loading ? " cursor-progress" : "")}
						        onClick={handleAddNewStudent}>Submit</Button>
					</div>
				</DialogFooter>
			</form>
		</>)
	}
	
	return (<AuthWrapper>
		<div className="min-h-screen bg-gray-100">
			<Header/>
			<main className="p-6 space-y-8">{classData && (<EditClassDialog
				isOpen={isEditClassOpen}
				onClose={() => setIsEditClassOpen(false)}
				classData={classData}
				onUpdate={fetchClassData}
			/>)}
				<Dialog open={isOpenManage} onOpenChange={setIsOpenManage}>
					{selectedStudent && (<StudentDetailsPopUp
						student={selectedStudent}
						classId={classData.id}
						onClose={() => {
							setIsOpenManage(false);
							setSelectedStudent(null);
						}}
						onUpdate={handleUpdate} // Refresh student data
					/>)}
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
						<div>
							<h1 className="text-3xl font-bold pb-1">{classData ? classData.name : 'Class Name'}</h1>
							<Button size="sm" className="h-7 gap-1 flex items-center"
							        onClick={() => setIsEditClassOpen(true)}>
								<EditIcon className="w-4 h-4"/> {/* Replace this with your actual edit icon */}
								<span className="ml-2 py-1">Edit Class</span>
							</Button></div>
						<div>
							<p className="font-medium pt-4">{classData ? classData.description : 'No description available'}</p>
						</div>
					</section>
					<section
						className="space-y-1 bg-background border-2 p-2 rounded-lg justify-center flex flex-col">
						<p className="text-gray-600">Please share the class link with your students</p>
						<p className="font-medium flex flex-row">
							Class Link: <span
							className="font-normal pl-1">classaccess.tech/join/{classCode}</span>
							<Copy className="h-5 w-5 hover:cursor-pointer ml-2" onClick={handleCopyLink}/>
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
								{studentData.length > 0 ? studentData.map(student => (<TableRow
									key={student.id}
									className="hover:cursor-pointer"
									onClick={() => {
										setSelectedStudent(student);
										setIsOpenManage(true);
									}}>
									<TableCell>{(student.first_name && student.last_name) ? `${student.first_name} ${student.last_name}` : 'Student Invited'}</TableCell>
									<TableCell>{student.email}</TableCell>
									<TableCell>{student.classes_left[classData.id]}</TableCell>
								</TableRow>)) : (<TableRow>
									<TableCell colSpan={4}>No students data available yet.</TableCell>
								</TableRow>)}
							</TableBody>
						</Table>
					</div>
				</section>
			</main>
		</div>
	</AuthWrapper>);
}