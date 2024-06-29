"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/page_components/header";
import Footer from '@/components/page_components/footer';

export default function Component() {
  const [credits, setCredits] = useState(1); // Replace 1 with your actual credit value
  const [willPay, setWillPay] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <main className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-4xl flex justify-center items-center">
          <Card className="w-[40vw]">
            <div className="mb text-center">
              <h1 className="text-l font-bold tracking-tight text-foreground sm:text-2xl pt-6">Class Name</h1>
              <h2><p className="text-muted-foreground">Teacher: John Doe</p></h2>
            </div>
            <div className="rounded-lg bg-card p-3 shadow-sm">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row"></div>
              {credits < 2 && (
                <div className="mt-6 rounded-lg bg-red-500 px-4 py-3 text-red-50">
                  <div className="flex items-center">
                    <TriangleAlertIcon className="mr-2 h-5 w-5" />
                    <p className="text-sm font-medium">
                      Kindly Pay before your next class.
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-6 flex items-center">
                <input
                  type="checkbox"
                  id="willPay"
                  checked={willPay}
                  onChange={() => setWillPay(!willPay)}
                  className="mr-2 w-5 h-5 rounded-bl-2xl border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="willPay" className="text-m text-foreground text-xl">I will pay</label>
              </div>
              {willPay && (
                <div className="mt-6 flex justify-end">
                  <Button className="w-full sm:w-auto">Join Class</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

function TriangleAlertIcon(props) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
