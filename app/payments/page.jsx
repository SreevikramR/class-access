"use client"
import React, {useEffect, useState} from 'react'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'
import AuthWrapper from '@/components/page_components/authWrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PaymentsTab from '@/components/page_components/paymentsPage/paymentsTab'
import { ReceiptTextIcon, WalletIcon } from 'lucide-react'

const Payments = () => {

	return (<AuthWrapper>
		<div className="flex flex-col min-h-screen">
			<Header/>
			<main className="flex-1 bg-gray-100 p-6 md:p-10 md:pt-8">
				<Tabs defaultValue="payments">
					<TabsList>
						<TabsTrigger value="payments" className="">Payments<WalletIcon className='ml-2 w-4 h-4' /></TabsTrigger>
						<TabsTrigger value="invoices" className="ml-4">Invoices<ReceiptTextIcon className='ml-2 w-4 h-4' /></TabsTrigger>
					</TabsList>
					<TabsContent value="payments" className="w-full p-1 pt-2">
						<PaymentsTab />
					</TabsContent>
				</Tabs>
			</main>
			<Footer/>
		</div>
	</AuthWrapper>)
}

export default Payments