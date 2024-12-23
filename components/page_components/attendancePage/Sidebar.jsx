import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandList, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, ChevronRightIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar({ selectedClassId, setSelectedClassId, selectedStudent, setSelectedStudent, classSelectValue, setClassSelectValue, classes, students }) {
	const [classSelectOpen, setClassSelectOpen] = useState(false);
	const buttonRef = useRef(null);
	const [popoverWidth, setPopoverWidth] = useState("auto");

	const handleClassSelect = (classId, className) => {
		setClassSelectValue(className);
		setSelectedClassId(classId);
		setSelectedStudent(false)
		setClassSelectOpen(false);
	};

	const handleStudentSelect = (student) => {
		setSelectedStudent(student);
	};

	useEffect(() => {
		if (buttonRef.current) {
			setPopoverWidth(`${buttonRef.current.offsetWidth}px`);
		}
	}, []);

	function ClassSelectionCombobox() {
		return (
			<Popover open={classSelectOpen} onOpenChange={setClassSelectOpen} className="w-full">
				<PopoverTrigger asChild>
					<Button
						ref={buttonRef}
						variant={"outline"}
						className="w-full justify-start text-left font-normal mb-6">
						<ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
						{classSelectValue}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="p-0" style={{ width: popoverWidth }}>
					<Command>
						<CommandInput placeholder="Search Class..." />
						<CommandEmpty>No Class found.</CommandEmpty>
						<CommandGroup>
							<CommandList>
								{classes.map((classItem) => (
									<CommandItem
										key={classItem.id}
										value={classItem.id}
										onSelect={() => handleClassSelect(classItem.id, classItem.name)}
									>
										<Check
											className={
												"mr-2 h-4 w-4" +
												(classSelectValue === classItem.id ? " opacity-100" : " opacity-0")
											}
										/>
										{classItem.name}
									</CommandItem>
								))}
							</CommandList>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		)
	}

	function StudentList() {
		return (
			<div className="flex-1 overflow-auto">
				<div className="space-y-2">
					{students.map((student) => (<div
						key={student.id}
						onClick={() => handleStudentSelect(student)}
						className={`flex items-center justify-between border-[1px] border-zinc-400 hover:bg-zinc-200 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${selectedStudent && selectedStudent.id === student.id ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}
					>
						<div className="flex items-center gap-3">
							<Avatar className="h-8 w-8 border">
								<AvatarFallback>{student.first_name.charAt(0)}{student.last_name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
								{student.first_name === "Student" && student.last_name === "Invited" ? student.email : `${student.first_name} ${student.last_name}`}
							</div>
						</div>
						<ChevronRightIcon className="h-4 w-4"/>
					</div>))}
				</div>
			</div>
		)
	}

	return (
		<aside className="w-[30vw] bg-white rounded-lg shadow-sm p-6 space-y-6 flex flex-col justify-between">
			<div>
				<div className="space-y-2">
					<ClassSelectionCombobox />
				</div>

				<div className="space-y-2">
					<h2 className="text-lg font-semibold">Students</h2>
					<StudentList />
				</div>
			</div>

			<div className="pt-4 mt-auto">
				{selectedStudent && (<Button className="w-full" variant="default">
					<Download className="w-4 h-4 mr-2" />
					Export Attendance
				</Button>)}
			</div>
		</aside>
	);
}
