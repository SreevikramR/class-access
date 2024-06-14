"use client"
import React from 'react'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

const page = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 md:p-10">
                <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16">
                                <AvatarImage src="/placeholder-user.jpg" />
                                <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <div>
                                <h2 className="text-xl font-bold">John Doe</h2>
                                <p className="text-gray-500">john.doe@example.com</p>
                                <p className="text-gray-500">+1 (123) 456-7890</p>
                                <p className="text-gray-500">United States</p>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center justify-between">
                                <div>
                                <h3 className="text-lg font-bold">Classes Paid For</h3>
                                <div className="flex items-center space-x-2">
                                    <Button variant="outline" size="sm">
                                    -
                                    </Button>
                                    <span className="text-2xl font-bold">5</span>
                                    <Button variant="outline" size="sm">
                                    +
                                    </Button>
                                </div>
                                </div>
                                <div>
                                <h3 className="text-lg font-bold">Total Paid</h3>
                                <p className="text-2xl font-bold">$500</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6 max-h-[30vh] overflow-y-scroll">
                            <h2 className="text-xl font-bold mb-4">Attendance</h2>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                <p>2023-04-01</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-02</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-03</p>
                                <Badge variant="danger">Absent</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-04</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-05</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-05</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-05</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-05</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-05</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                <p>2023-04-05</p>
                                <Badge variant="success">Present</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Payments</h2>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                            <TableCell>2023-04-01</TableCell>
                            <TableCell>$100</TableCell>
                            <TableCell>Credit Card</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>2023-03-15</TableCell>
                            <TableCell>$200</TableCell>
                            <TableCell>PayPal</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell>2023-02-28</TableCell>
                            <TableCell>$200</TableCell>
                            <TableCell>Bank Transfer</TableCell>
                            </TableRow>
                        </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    )
}

export default page