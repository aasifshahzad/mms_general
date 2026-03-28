"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { motion } from "framer-motion";

export function TeacherDashboard() {
  const [studentStats, setStudentStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
  });

  useEffect(() => {
    // TODO: Fetch teacher's class statistics
    // This would call API endpoints specific to the teacher's assigned class
    setStudentStats({
      total: 0,
      present: 0,
      absent: 0,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header value="Teacher Dashboard" />
      <div className="px-4 sm:px-6 lg:px-8 py-2">
        <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
          👨‍🏫 Teacher - Class & Attendance Management
        </div>
      </div>
      <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Students:</span>
                <span className="font-bold text-xl text-blue-600">{studentStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Present Today:</span>
                <span className="font-bold text-xl text-green-600">{studentStats.present}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Absent Today:</span>
                <span className="font-bold text-xl text-red-600">{studentStats.absent}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition">
                Mark Attendance
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition">
                View Students
              </button>
            </div>
          </motion.div>

          {/* Attendance Report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Report</h3>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Attendance Rate</p>
              <p className="text-4xl font-bold text-blue-600">--</p>
              <p className="text-sm text-gray-500 mt-2">No data available</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
