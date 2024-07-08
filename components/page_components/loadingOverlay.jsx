import React from 'react'

const LoadingOverlay = ({ children }) => {
    return (
        <>
            <div className='absolute z-30 h-full w-full bg-slate-600 opacity-50 justify-center text-center'>
                <span className='text-3xl text-black'>Loading...</span>
            </div>
        </>
    )
}

export default LoadingOverlay