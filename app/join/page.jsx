"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/page_components/header";
import Footer from '@/components/page_components/footer';
import { ShareIcon } from "lucide-react";

export default function Component() {
  const [credits, setCredits] = useState(1); // Replace 1 with your actual credit value

  return (
    <div className="min-h-screen flex flex-col">
      <Header/>
      <div/>
      <main className="flex-1 p-4 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex min-h-[10dvh] items-center justify-center bg-muted px-4 py-5 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl pt-4">Class Name</h1>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      <span className="text-4xl">{credits}</span> Credits
                    </p>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                  </div>

                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Intro to Computer Science</p>
                    <p className="text-muted-foreground">1 credits</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Teacher: John Doe</p> {/* Replace with actual teacher's name */}
                  </div>
                </div>
                {credits < 2 && (
                  <div className="mt-6 rounded-lg bg-red-500 px-4 py-3 text-red-50">
                    <div className="flex items-center">
                      <TriangleAlertIcon className="mr-2 h-5 w-5" />
                      <p className="text-sm font-medium">
                        You have less than 2 credits remaining. Please register for more classes.
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-6 flex justify-end">
                  <Button className="w-full sm:w-auto">Join Class</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <div />
      <Footer/>
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
