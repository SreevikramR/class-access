import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/page_components/header"
import { PlusCircle } from "lucide-react"

export default function ManagePage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header/>
            <main className="p-6 space-y-8">
                <section className="space-y-1">
                    <h1 className="text-3xl font-bold">Class Name</h1>
                    <p className="font-medium">Wednesdays at 10am</p>
                    <p className="text-gray-600">Class Description</p>
                </section>
                <section>
                    <div className="flex items-center justify-between my-2">
                        <h2 className="text-2xl font-semibold px-2">My Students</h2>
                        <Button size="sm" className="h-7 gap-1">
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


function BellIcon(props) {
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    )
}

function DollarSignIcon(props) {
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
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}

function LogInIcon(props) {
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
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" x2="3" y1="12" y2="12" />
        </svg>
    )
}


function PlusIcon(props) {
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}


function SearchIcon(props) {
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}