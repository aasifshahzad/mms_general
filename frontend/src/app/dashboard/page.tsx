'use client'
import React, { useEffect } from 'react'
import { useTheme } from "next-themes"

const Dashboard = () => {
    const { setTheme } = useTheme()
    useEffect(() => {
        setTheme("light")
    }, [setTheme])  // Added setTheme to the dependency array
    
  return (
    <div>page</div>
  )
}

export default Dashboard