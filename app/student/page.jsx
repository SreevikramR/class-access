"use client"
import React from 'react'
import Header from '@/components/page_components/header'
import Footer from '@/components/page_components/footer'

const page = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 md:p-10">
                <div>Some Text</div>
            </main>
            <Footer/>
        </div>
    )
}

export default page