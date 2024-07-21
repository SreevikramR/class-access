import React from 'react'

const ClassesLeftBar = ({ classesLeft }) => {

    let color = ""
    if (classesLeft < 3) {
        color = "bg-red-500"
    } else if (classesLeft < 6) {
        color = "bg-yellow-300"
    } else {
        color = "bg-green-500"
    }

    let elements = []
    for (let i = 0; i < 8; i++) {
        if (classesLeft == 0) {
            if (i == 0) {
                elements.push(
                    <div className='text-red-500 font-semibold'>No Classes Left</div>
                )
            }
        } else if ( i < classesLeft) {
            if (i == 0) {
                elements.push(
                    <div className={"h-full border-2 rounded-l-md border-black flex-1 " + color} style={{ width: "12.5%" }} />
                )
            } else if (i == 7) {
                elements.push(
                    <div className={"h-full border-2 rounded-r-md border-black flex-1 " + color} style={{ width: "12.5%" }} />
                )
            } else {
                elements.push(
                    <div className={"h-full border-2 border-black flex-1 " + color} style={{ width: "12.5%" }} />
                )
            }
        } else if ( classesLeft< 0) {
            if (i == 0) {
                elements.push(
                    <div className='text-red-500 font-semibold'>Negative Balance: {classesLeft}</div>
                )
            }
        } else {
            if (i == 0) {
                elements.push(
                    <div className="h-full border-2 rounded-l-md border-black flex-1" style={{ width: "12.5%" }} />
                )
            } else if (i == 7) {
                elements.push(
                    <div className="h-full border-2 rounded-r-md border-black flex-1" style={{ width: "12.5%" }} />
                )
            } else {
                elements.push(
                    <div className="h-full border-2 border-black flex-1" style={{ width: "12.5%" }} />
                )
            }
        }
    }

    return (
        <div className="flex h-6 w-full items-center gap-0.5">
            {elements}
        </div>
    )
}

export default ClassesLeftBar