"use client"
import React, { useState } from 'react'
import { Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-react'
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"

const MarkAttendance = () => {
    const [date, setDate] = useState(new Date())
    const [classSelectOpen, setClassSelectOpen] = React.useState(false)
    const [classSelectValue, setClassSelectValue] = React.useState("Select Class")

    function DatePickerPopup() {
        return (
            <PopoverContent className="w-[auto] p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        )
    }

    function ClassSelectionCombobox() {
        const frameworks = [
            {
                value: "next.js",
                label: "Next.js",
            },
            {
                value: "sveltekit",
                label: "SvelteKit",
            },
            {
                value: "nuxt.js",
                label: "Nuxt.js",
            },
            {
                value: "remix",
                label: "Remix",
            },
            {
                value: "astro",
                label: "Astro",
            },
        ]
        return (
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Search Class..." />
                    <CommandEmpty>No Class found.</CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    key={framework.label}
                                    value={framework.label}
                                    onSelect={(currentValue) => {
                                        setClassSelectValue(currentValue)
                                        setClassSelectOpen(false)
                                    }}
                                >
                                    <Check className={"mr-2 h-4 w-4" + (classSelectValue === framework.label ? " opacity-100" : " opacity-0")} />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        )
    }

    return (
        <>
            <Popover open={classSelectOpen} onOpenChange={setClassSelectOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className="w-[250px] mr-2 justify-start text-left font-normal ">
                        <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        {classSelectValue}
                    </Button>
                </PopoverTrigger>
                <ClassSelectionCombobox classSelectValue={classSelectValue} setClassSelectValue={setClassSelectValue} setOpen={setClassSelectOpen} />
            </Popover>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={"w-[280px] ml-2 justify-start text-left font-normal " + (!date && " text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <DatePickerPopup date={date} setDate={setDate} />
            </Popover>
        </>
    )
}

export default MarkAttendance