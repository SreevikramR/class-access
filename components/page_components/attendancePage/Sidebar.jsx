import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandList, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

export function Sidebar({ selectedClassId, setSelectedClassId, selectedStudent, setSelectedStudent, onStudentChange, classSelectValue, setClassSelectValue, classes }) {
	const [classSelectOpen, setClassSelectOpen] = useState(false);
	const buttonRef = useRef(null);
	const [popoverWidth, setPopoverWidth] = useState("auto");

	const students = ["John Doe", "Jane Smith", "Bob Johnson"];

	const handleClassSelect = (classId, className) => {
		setClassSelectValue(className);
		setSelectedClassId(classId);
		setSelectedStudent(false)
		setClassSelectOpen(false);
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

	return (
		<aside className="w-[30vw] bg-white rounded-lg shadow-sm p-6 space-y-6">
			<div className="space-y-2">
				<ClassSelectionCombobox />
			</div>

			<div className="space-y-2">
				<h2 className="text-sm font-semibold">Select Student</h2>
				<div className="space-y-1">
					{students.map((student) => (
						<button
							key={student}
							onClick={() => onStudentChange(student)}
							className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                ${
						selectedStudent === student
							? "bg-blue-50 text-blue-700"
							: "hover:bg-gray-100"}`}
						>
							{student}
						</button>
					))}
				</div>
			</div>

			<div className="pt-4 mt-auto">
				<Button className="w-full" variant="default">
					<Download className="w-4 h-4 mr-2" />
					Export Attendance
				</Button>
			</div>
		</aside>
	);
}
