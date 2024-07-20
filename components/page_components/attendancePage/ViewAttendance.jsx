import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Calendar as CalendarIcon } from 'lucide-react'
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from '@/components/ui/card'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandGroup, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command'
//
const ViewAttendance = () => {
    const [classSelectOpen, setClassSelectOpen] = React.useState(false)
    const [classSelectValue, setClassSelectValue] = React.useState("Select Class")

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
        <Card className="grid w-full min-h-screen grid-cols-[300px_1fr] bg-background text-foreground">
            <div className="border-r bg-muted/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Class</h1>
                </div>
                <Popover open={classSelectOpen} onOpenChange={setClassSelectOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-[250px] mr-2 justify-start text-left font-normal mb-6">
                            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            {classSelectValue}
                        </Button>
                    </PopoverTrigger>
                    <ClassSelectionCombobox classSelectValue={classSelectValue} setClassSelectValue={setClassSelectValue} setOpen={setClassSelectOpen} />
                </Popover>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Students</h1>
                </div>
                <div className="flex-1 overflow-auto">
                    <div className="space-y-2">
                        <Link
                            href="#"
                            className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            prefetch={false}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src="/placeholder-user.jpg" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <div>John Doe</div>
                            </div>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            prefetch={false}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src="/placeholder-user.jpg" />
                                    <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <div>Jane Smith</div>
                            </div>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            prefetch={false}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src="/placeholder-user.jpg" />
                                    <AvatarFallback>MJ</AvatarFallback>
                                </Avatar>
                                <div>Michael Johnson</div>
                            </div>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            prefetch={false}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src="/placeholder-user.jpg" />
                                    <AvatarFallback>ED</AvatarFallback>
                                </Avatar>
                                <div>Emily Davis</div>
                            </div>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            href="#"
                            className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            prefetch={false}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border">
                                    <AvatarImage src="/placeholder-user.jpg" />
                                    <AvatarFallback>DL</AvatarFallback>
                                </Avatar>
                                <div>David Lee</div>
                            </div>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Attendance History</h1>
                    {/* <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            Print
                        </Button>
                    </div> */}
                </div>
                <div className="overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Classes Left</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            
                            <TableRow>
                                <TableCell>2023-04-01</TableCell>
                                <TableCell>1</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Present</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2023-04-02</TableCell>
                                <TableCell>2</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Present</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2023-04-03</TableCell>
                                <TableCell>3</TableCell>   
                                <TableCell>
                                    <Badge variant="outline">Absent</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2023-04-04</TableCell>
                                <TableCell>4</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Present</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2023-04-05</TableCell>
                                <TableCell>5</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Present</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2023-04-06</TableCell>
                                <TableCell>6</TableCell>
                                <TableCell>
                                    <Badge variant="outline">Absent</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2023-04-07</TableCell>
                                <TableCell>7</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Present</Badge>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>2023-04-08</TableCell>
                                <TableCell>8</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">Present</Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Card>
    )
}


function ChevronRightIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}


function XIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}

export default ViewAttendance