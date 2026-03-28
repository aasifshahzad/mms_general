"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { motion } from "framer-motion";

export function StudentDashboard() {
  const [studentData, setStudentData] = useState({
    name: "Loading...",
    rollNumber: "--",
    class: "--",
    attendance: 0,
    totalDue: 0,
    totalPaid: 0,
  });

  useEffect(() => {
    // TODO: Fetch student's own data from API
    // Filter data by current user's student_id
    setStudentData({
      name: "Student Name",
      rollNumber: "001",
      class: "Class Name",
      attendance: 0,
      totalDue: 0,
      totalPaid: 0,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header value="My Dashboard" />
      <div className="px-4 sm:px-6 lg:px-8 py-2">
        <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
          👤 Student - Personal Dashboard
        </div>
      </div>
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Profile</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-semibold text-gray-800">{studentData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Roll Number</p>
                <p className="text-lg font-semibold text-gray-800">{studentData.rollNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class</p>
                <p className="text-lg font-semibold text-gray-800">{studentData.class}</p>
              </div>
            </div>
          </motion.div>

          {/* Attendance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Attendance</h3>
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Attendance Rate</p>
                <p className="text-4xl font-bold text-blue-600">{studentData.attendance}%</p>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
                View Detailed Attendance
              </button>
            </div>
          </motion.div>

          {/* Fee Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md md:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{studentData.totalPaid}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                <p className="text-2xl font-bold text-red-600">{studentData.totalDue}</p>
              </div>
            </div>
            <button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition">
              View Fee Details
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
