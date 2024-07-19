"use client"
import React, {useEffect, useState} from 'react'
import {Label} from '@/components/ui/label'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Checkbox} from '@/components/ui/checkbox'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {CheckCircle, CircleArrowRight} from 'lucide-react'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {supabaseClient} from '@/components/util_function/supabaseCilent'
import {useToast} from "@/components/ui/use-toast";
import fetchTimeout from "@/components/util_function/fetch";

// import createZoomMeeting from '@/components/util_function/createZoomMeeting'

const CreateClassPopup = ({isOpen, setIsOpen}) => {
	const [classCreationStep, setClassCreationStep] = useState(0)
	const [className, setClassName] = useState("")
	const [classDescription, setClassDescription] = useState("")
	const [selectedDays, setSelectedDays] = useState([])
	const [startTime, setStartTime] = useState({hour: "12", minute: "00", ampm: "AM"})
	const [endTime, setEndTime] = useState({hour: "01", minute: "00", ampm: "AM"})
	const [selectedStudents, setSelectedStudents] = useState([])
	const [loading, setLoading] = useState(false)
	const {toast} = useToast()
	const [students, setStudents] = useState([])
	const [newStudentEmail, setNewStudentEmail] = useState('')
	const [newStudentNotes, setNewStudentNotes] = useState('')
	const [zoomLink, setZoomLink] = useState("")
	const [tempNewStudents, setTempNewStudents] = useState([]);
	const resetAllStates = () => {
		setClassName("")
		setClassDescription("")
		setSelectedDays([])
		setStartTime({hour: "12", minute: "00", ampm: "AM"})
		setEndTime({hour: "01", minute: "00", ampm: "AM"})
		setSelectedStudents([])
		setNewStudentEmail('')
		setNewStudentNotes('')
		setZoomLink('')
		setClassCreationStep(0)
		setTempNewStudents([]);
		
	}
	const updateTeacherClassIds = async (teacherUUID) => {
		// Fetch all class IDs for the teacher
		const {data: classData, error: classError} = await supabaseClient
			.from('classes')
			.select('id')
			.eq('teacher_id', teacherUUID);
		
		if (classError) {
			console.log("Error fetching class data:", classError);
			return "Error";
		}
		
		// Extract class IDs into an array
		const classIds = classData.map(cls => cls.id);
		console.log(classIds);
		// Update the teacher's class_ids in the teachers table
		const {data: updateData, error: updateError} = await supabaseClient
			.from('teachers')
			.update({class_ids: classIds})
			.eq('id', teacherUUID)
			.select();
		
		if (updateError) {
			console.log("Error updating teacher's class_ids:", updateError);
			return "Error";
		}
		
		return "Success";
	};
	const generateRandomString = (length) => {
		const getRandomCharacter = () => {
			const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
			return characters[Math.floor(Math.random() * characters.length)];
		}
		let result = '';
		for (let i = 0; i < length; i++) {
			result += getRandomCharacter();
		}
		return result;
	}
	
	const handleCreateClass = async () => {
		if (loading) return;
		setLoading(true)
		try {
			const code = generateRandomString(6);
			
			const {data: {user}, error: authError} = await supabaseClient.auth.getUser();
			if (authError || !user) {
				console.error('Authentication error:', authError);
				toast({
					variant: 'destructive',
					title: "Failed to create class",
					description: "Authentication error. Please log in again.",
					duration: 3000
				});
				setLoading(false)
				return;
			}
			
			const classData = {
				name: className,
				description: classDescription,
				days: selectedDays,
				teacher_id: user.id,
				start_time: `${startTime.hour}:${startTime.minute} ${startTime.ampm}`,
				end_time: `${endTime.hour}:${endTime.minute} ${endTime.ampm}`,
				student_proxy_ids: selectedStudents.filter(s => !s.isNew).map(s => s.id),
				class_code: code,
				meeting_link: zoomLink,
			};
			
			// Insert class data
			const {data: classInsertData, error: classError} = await supabaseClient
				.from('classes')
				.insert([classData])
				.select('id');
			
			if (classError) throw classError;
			
			// Handle students
			const {data: teacherData, error: teacherError} = await supabaseClient
				.from('teachers')
				.select('first_name, last_name')
				.eq('id', classData.teacher_id)
				.single()
			
			if (teacherError) throw teacherError;
			
			const jwt = (await supabaseClient.auth.getSession()).data.session.access_token;
			const refreshToken = (await supabaseClient.auth.getSession()).data.session.refresh_token;
			
			let addedAllStudents = true;
			for (const student of selectedStudents) {
				const headers = {
					"jwt": jwt,
					"refresh_token": refreshToken,
					"teacher_name": `${teacherData.first_name} ${teacherData.last_name}`,
					"email": student.email,
					"notes": student.notes || '',
					"classes_left": 0,
					"class_id": classInsertData[0].id,
					"class_code": code,
					"class_name": className
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
			
			console.log("Class created successfully and students updated!");
			const updateTeacherClassIdsStatus = await updateTeacherClassIds((await supabaseClient.auth.getUser()).data.user.id)
				if (updateTeacherClassIdsStatus === "Error") {
					console.log("Error updating teacher's class IDs");
				}
			if (addedAllStudents) {
				
				toast({
					className: "bg-green-500 border-black border-2",
					title: "Class Successfully Added",
					description: "The new class has been added and students have been updated",
					duration: 3000
				});
				resetAllStates();
				setIsOpen(false);
			}
			setLoading(false)
		} catch (error) {
			console.error("Error creating class or updating students");
			toast({
				variant: 'destructive',
				title: "Failed to create class or update students",
				description: "Please try again.",
				duration: 3000
			});
			setLoading(false)
		}
		setLoading(false)
	};
	
	const _classNameAndDescription = () => {
		return (<div>
				<DialogHeader>
					<DialogTitle>Create Class</DialogTitle>
					<DialogDescription>Enter a name, description, and Zoom link for your class</DialogDescription>
				</DialogHeader>
				<form className="space-y-4 pt-3">
					<div>
						<Label htmlFor="Name">Name</Label>
						<Input id="name" type="name" value={className} placeholder="Class Name"
						       onChange={(e) => setClassName(e.target.value)} required/>
					</div>
					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea id="description" value={classDescription}
						          onChange={(e) => setClassDescription(e.target.value)}/>
					</div>
					<div>
						<Label htmlFor="zoomLink">Zoom Link</Label>
						<Input id="zoomLink" type="url" value={zoomLink} placeholder="https://zoom.us/j/example"
						       onChange={(e) => setZoomLink(e.target.value)} required/>
					</div>
					<DialogFooter>
						<div className='flex justify-between flex-wrap w-full'>
							<Button className="border-slate-400 hover:border-black" variant="outline"
							        onClick={() => setIsOpen(false)}>Cancel</Button>
							<Button type="button" onClick={() => {
								if (!className || !zoomLink) {
									toast({
										title: 'Incomplete Fields',
										description: 'Class name and Zoom link are required.',
										variant: "destructive",
									})
									return
								}
								setClassCreationStep(1);
							}} className="gap-2">Pick Days<CircleArrowRight className="h-5 w-5"/></Button>
						</div>
					</DialogFooter>
				</form>
			
			</div>)
	}
	
	const _classDays = () => {
		const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
		return (<div>
				<DialogHeader>
					<DialogTitle>Create Class</DialogTitle>
					<DialogDescription>Select the days for your new class.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 pt-8 py-4">
					<div className="grid grid-cols-2 gap-4">
						{days.map(day => (<div key={day} className="flex items-center gap-2">
								<Checkbox
									id={day}
									checked={selectedDays.includes(day)}
									onCheckedChange={(checked) => {
										if (checked) {
											setSelectedDays([...selectedDays, day])
										} else {
											setSelectedDays(selectedDays.filter(d => d !== day))
										}
									}}
								/>
								<Label htmlFor={day}>{day}</Label>
							</div>))}
					</div>
				</div>
				<DialogFooter>
					<div className='flex pt-6 justify-between flex-wrap w-full'>
						<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={() => setClassCreationStep(0)}>Back</Button>
						<Button type="button" onClick={() => {
							if (selectedDays.length === 0) {
								
								toast({
									title: 'Incomplete Fields',
									description: 'Please select at least one day',
									variant: "destructive"
								})
								return
							}
							
							setClassCreationStep(2);
						}} className="gap-2">Choose Timings<CircleArrowRight className="h-5 w-5"/></Button>
					</div>
				</DialogFooter>
			</div>)
	}
	
	const _classTimings = () => {
		return (<div className='flex w-full flex-col'>
				<DialogHeader>
					<DialogTitle>Create Class</DialogTitle>
					<DialogDescription>Pick the timing for your class</DialogDescription>
				</DialogHeader>
				
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
				<DialogFooter>
					<div className='flex justify-between flex-wrap w-full pt-6'>
						<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={() => setClassCreationStep(1)}>Back</Button>
						<Button type="button" onClick={() => setClassCreationStep(3)} className="gap-2">Add
							Students<CircleArrowRight className="h-5 w-5"/></Button>
					</div>
				</DialogFooter>
			</div>)
	}//
	
	const _studentTileForStudentList = (student) => {
		const isSelected = selectedStudents.some(s => s.id === student.id);
		
		return (<div className="flex items-center justify-between">
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
							setSelectedStudents([...selectedStudents, {
								id: student.id, email: student.email, name: student.name
							}]);
						} else {
							setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
						}
					}}
				/>
			</div>)
	}
	
	const handleAddStudent = async () => {
		if (!newStudentEmail) {
			toast({title: 'Incomplete Fields', description: 'Student email is required.', variant: "destructive",});
			return;
		}
		
		const newTempStudent = {
			id: null, name: newStudentEmail.split('@')[0], email: newStudentEmail, isNew: true, notes: newStudentNotes // Add this line
		};
		
		setTempNewStudents([...tempNewStudents, newTempStudent]);
		setSelectedStudents([...selectedStudents, newTempStudent]);
		setNewStudentEmail('');
		setNewStudentNotes('');
	};
	
	const fetchStudents = async () => {
		try {
			const {data, error} = await supabaseClient
				.from('student_proxies')
				.select('*')
				.eq('teacher_id', `{${(await supabaseClient.auth.getUser()).data.user.id}}`);
			
			if (error) throw error;
			
			// Transform the data to match the expected format
			const formattedStudents = data.map(student => ({
				id: student.id, name: student.first_name + ' ' + student.last_name, email: student.email,
				
			}));
			
			setStudents(formattedStudents);
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
	
	useEffect(() => {
		if (classCreationStep === 3) {
			const fetchStudentsData = async () => {
				const {data: {user}} = await supabaseClient.auth.getUser();
				if (user) {
					await fetchStudents(user.id);
				} else {
					console.error('No authenticated user found');
					toast({
						variant: 'destructive',
						title: "Authentication Error",
						description: "Please login again.",
						duration: 3000
					});
				}
			};
			fetchStudentsData();
		}
	}, [classCreationStep]);
	
	const _studentList = () => {
		return (<div>
				<DialogHeader>
					<DialogTitle className="text-center">Create Class</DialogTitle>
					<DialogDescription className="text-center">Select the students you would like to add to your
						class<br/>You will be able to add more students later.</DialogDescription>
				</DialogHeader>
				<div className='flex w-full flex-row mt-6'>
					<div className='flex flex-col w-1/2 pr-4 border-r-2'>
						<div className='text-center font-semibold mb-2'>Existing Student</div>
						<div
							className="bg-muted border-2 rounded-md p-4 my-4 h-[40vh] max-h-[40vh] overflow-y-auto grid gap-2">
							{students.length === 0 && tempNewStudents.length === 0 &&
								<span className='text-sm'>You have not added any students yet</span>}
							{students.map(student => _studentTileForStudentList(student))}
							{tempNewStudents.map(student => _studentTileForStudentList(student))}
						</div>
					</div>
					<div className='flex flex-col w-1/2 pl-4 justify-center'>
						<div className='text-center font-semibold mb-2'>New Student</div>
						<div>
							<Label htmlFor="email" className="font-normal">Email</Label>
							<Input
								id="student-email"
								type="email"
								value={newStudentEmail}
								onChange={(e) => setNewStudentEmail(e.target.value)}
								placeholder="Student Email"
								required
							/>
						</div>
						<div className='mt-2'>
							<Label htmlFor="email" className="font-normal">Notes</Label>
							<Textarea
								id="student-notes"
								value={newStudentNotes}
								onChange={(e) => setNewStudentNotes(e.target.value)}
								placeholder="Additional Notes"
							/>
						</div>
						<div className='mt-4 w-full'>
							<Button type="button" onClick={handleAddStudent} className="gap-2">Add
								Student<CircleArrowRight className="h-5 w-5"/></Button>
						</div>
					</div>
				</div>
				
				<DialogFooter>
					<div className='flex justify-between flex-wrap w-full'>
						<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={() => setClassCreationStep(2)}>Back</Button>
						<Button type="button" onClick={() => {
							setClassCreationStep(4);
						}} className="gap-2">Verify<CircleArrowRight className="h-5 w-5"/></Button>
					</div>
				</DialogFooter>
			</div>)
	}
	
	const _reviewDetails = () => {
		const classData = {
			name: className,
			description: classDescription,
			days: selectedDays,
			startTime: `${startTime.hour}:${startTime.minute} ${startTime.ampm}`,
			endTime: `${endTime.hour}:${endTime.minute} ${endTime.ampm}`,
			capacity: selectedStudents.length,
			zoomLink: zoomLink, // Add this line
		};
		
		return (<>
				<DialogHeader>
					<DialogTitle>Confirm Class Details</DialogTitle>
					<DialogDescription>Review the details of the new class before creating it.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-6 py-6">
					<div className="grid grid-cols-[120px_1fr] items-center gap-4">
						<Label htmlFor="class-name">Class Name</Label>
						<div>{classData.name}</div>
					</div>
					<div className="grid grid-cols-[120px_1fr] items-start gap-4">
						<Label htmlFor="zoom-link">Zoom Link</Label>
						<div className="break-all text-pretty">{classData.zoomLink}</div>
					</div>
					{classDescription && <div className="grid grid-cols-[120px_1fr] items-center gap-4">
						<Label htmlFor="class-description">Description</Label>
						<div>{classData.description}</div>
					</div>}
					
					<div className="grid grid-cols-[120px_1fr] items-center gap-4">
						<Label htmlFor="class-days">Days</Label>
						<div>{classData.days.join(", ")}</div>
					</div>
					<div className="grid grid-cols-[120px_1fr] items-center gap-4">
						<Label htmlFor="class-time">Time</Label>
						<div>{`${classData.startTime} - ${classData.endTime}`}</div>
					</div>
					<div className="grid grid-cols-[120px_1fr] items-center gap-4">
						<Label htmlFor="students">Students</Label>
						<div>{classData.capacity}</div>
					</div>
				</div>
				<DialogFooter>
					<div className='flex justify-between flex-wrap w-full'>
						<Button className="border-slate-400 hover:border-black" variant="outline"
						        onClick={() => setClassCreationStep(3)}>Back</Button>
						<Button type="button" onClick={handleCreateClass}
						        className={"gap-2" + (loading ? " cursor-progress" : "")}>Confirm<CheckCircle
							className="h-5 w-5"/></Button>
					</div>
				</DialogFooter>
			</>)
	}
	
	return (<>
			<Dialog open={isOpen} onOpenChange={setIsOpen} defaultOpen>
				<DialogContent
					className={"sm:max-w-[425px] " + (classCreationStep === 3 ? "lg:max-w-[55vw]" : "lg:max-w-[32vw]")}>
					{classCreationStep === 0 && _classNameAndDescription()}
					{classCreationStep === 1 && _classDays()}
					{classCreationStep === 2 && _classTimings()}
					{classCreationStep === 3 && _studentList()}
					{classCreationStep === 4 && _reviewDetails()}
				</DialogContent>
			</Dialog>
		</>)
}

export default CreateClassPopup
