import React from 'react'

const ClassesLeftBar = ({ classesLeft }) => {

    return (
        <div className="flex h-6 w-full items-center gap-0.5">
            <div className="h-full border-2 border-black flex-1 rounded-l-md bg-green-500" style={{ width: "12.5%" }} />
            <div className="h-full border-2 border-black flex-1 bg-green-500" style={{ width: "12.5%" }} />
            <div className="h-full border-2 border-black flex-1 bg-green-500" style={{ width: "12.5%" }} />
            <div className="h-full border-2 border-black flex-1 bg-green-500" style={{ width: "12.5%" }} />
            <div className="h-full border-2 border-black flex-1 bg-green-500" style={{ width: "12.5%" }} />
            <div className="h-full border-2 border-black flex-1 bg-muted" style={{ width: "12.5%" }} />
            <div className="h-full border-2 border-black flex-1 bg-muted" style={{ width: "12.5%" }} />
            <div className="h-full border-2 border-black flex-1 rounded-r-md bg-muted" style={{ width: "12.5%" }} />
        </div>
    )
}

export default ClassesLeftBar