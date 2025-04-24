'use client'
// pages/admin/dashboard.js
import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Calendar, Clock, Users, Mail, AlertCircle, Check, X, TrendingUp, Briefcase, Award, Clock3 } from 'lucide-react';

// Mock data
const leaveStatusData = [
  { name: 'Approved', value: 42, color: '#4ade80' },
  { name: 'Pending', value: 15, color: '#facc15' },
  { name: 'Rejected', value: 8, color: '#f87171' },
];

const departmentAttendanceData = [
  { name: 'IT', attendance: 95, leave: 5 },
  { name: 'HR', attendance: 92, leave: 8 },
  { name: 'Finance', attendance: 97, leave: 3 },
  { name: 'Marketing', attendance: 88, leave: 12 },
  { name: 'Operations', attendance: 90, leave: 10 },
];

const monthlyTrendData = [
  { name: 'Jan', leaves: 12 },
  { name: 'Feb', leaves: 15 },
  { name: 'Mar', leaves: 18 },
  { name: 'Apr', leaves: 14 },
  { name: 'May', leaves: 22 },
  { name: 'Jun', leaves: 28 },
];

const pendingRequests = [
  { id: 1, name: 'Ahmed Ali', department: 'IT', type: 'Annual', days: 3, startDate: '25-Apr-2025' },
  { id: 2, name: 'Fatima Khan', department: 'Marketing', type: 'Sick', days: 2, startDate: '26-Apr-2025' },
  { id: 3, name: 'Bilal Ahmad', department: 'Finance', type: 'Casual', days: 1, startDate: '28-Apr-2025' },
];

const todayAbsentees = [
  { id: 1, name: 'Sara Malik', department: 'HR', type: 'Annual' },
  { id: 2, name: 'Usman Khan', department: 'IT', type: 'Sick' },
  { id: 3, name: 'Ayesha Siddiqui', department: 'Marketing', type: 'Casual' },
];

const topPerformers = [
  { id: 1, name: 'Zainab Akhtar', department: 'IT', attendance: '99%', productivity: '97%', rating: 5 },
  { id: 2, name: 'Hamza Malik', department: 'Finance', attendance: '98%', productivity: '96%', rating: 5 },
  { id: 3, name: 'Nadia Khan', department: 'Marketing', attendance: '97%', productivity: '95%', rating: 4.9 },
  { id: 4, name: 'Omar Farooq', department: 'Operations', attendance: '96%', productivity: '94%', rating: 4.8 },
];

const topLeaveEmployees = [
  { id: 1, name: 'Ali Hassan', department: 'Marketing', leavesTaken: 7, leaveType: 'Sick' },
  { id: 2, name: 'Saima Jabeen', department: 'HR', leavesTaken: 5, leaveType: 'Annual' },
  { id: 3, name: 'Tariq Mehmood', department: 'IT', leavesTaken: 4, leaveType: 'Casual' },
  { id: 4, name: 'Farah Ahmad', department: 'Operations', leavesTaken: 3, leaveType: 'Annual' },
  { id: 5, name: 'Imran Sheikh', department: 'Finance', leavesTaken: 3, leaveType: 'Sick' },
];

const recentLeaveRequests = [
  { id: 1, name: 'Ahmed Khan', department: 'IT', type: 'Casual', days: 1, status: 'Approved', date: '18-Apr-2025' },
  { id: 2, name: 'Sana Rafiq', department: 'HR', type: 'Sick', days: 2, status: 'Pending', date: '17-Apr-2025' },
  { id: 3, name: 'Kashif Ali', department: 'Marketing', type: 'Annual', days: 5, status: 'Approved', date: '16-Apr-2025' },
  { id: 4, name: 'Rabia Iqbal', department: 'Finance', type: 'Sick', days: 3, status: 'Rejected', date: '15-Apr-2025' },
];

const frequentLateComers = [
  { id: 1, name: 'Asad Mahmood', department: 'Operations', lateCount: 8, averageDelay: '22 mins' },
  { id: 2, name: 'Hina Ali', department: 'Marketing', lateCount: 6, averageDelay: '17 mins' },
  { id: 3, name: 'Faisal Khan', department: 'IT', lateCount: 5, averageDelay: '15 mins' },
  { id: 4, name: 'Samreen Zaidi', department: 'HR', lateCount: 4, averageDelay: '12 mins' },
];

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Leave Management System - Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, Admin</span>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button 
              onClick={() => setSelectedTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setSelectedTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'requests' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leave Requests
            </button>
            <button 
              onClick={() => setSelectedTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'performance' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance
            </button>
            <button 
              onClick={() => setSelectedTab('employees')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'employees' 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Staff Record
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div>
            {/* Summary Cards */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <div className="p-3 mr-4 bg-blue-100 rounded-full">
                  <Users className="text-blue-500" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-lg font-semibold text-gray-700">124</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <div className="p-3 mr-4 bg-green-100 rounded-full">
                  <Check className="text-green-500" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Present Today</p>
                  <p className="text-lg font-semibold text-gray-700">118</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <div className="p-3 mr-4 bg-red-100 rounded-full">
                  <X className="text-red-500" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Absent Today</p>
                  <p className="text-lg font-semibold text-gray-700">6</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <div className="p-3 mr-4 bg-yellow-100 rounded-full">
                  <AlertCircle className="text-yellow-500" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-lg font-semibold text-gray-700">15</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 mb-8 md:grid-cols-2">
              {/* Leave Status Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Leave Status Overview</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leaveStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Trend */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Leave Trends (2025)</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="leaves" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Department Attendance */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-lg font-semibold mb-4">Monthly Attendance by Department</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attendance" name="Attendance %" fill="#4ade80" />
                    <Bar dataKey="leave" name="Leave %" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 mb-8 md:grid-cols-2">
              {/* Recent Leave Requests */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Leave Requests</h2>
                  <button className="text-sm text-indigo-600 hover:text-indigo-900">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentLeaveRequests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{request.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{request.type}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{request.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Leave Takers */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Top 5 Leave Takers This Month</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leaves</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topLeaveEmployees.map((employee) => (
                        <tr key={employee.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{employee.leavesTaken}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{employee.leaveType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Second Two Column Layout */}
            <div className="grid gap-6 mb-8 md:grid-cols-2">
              {/* Top Performers */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Top Performing Employees</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topPerformers.map((performer) => (
                        <tr key={performer.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{performer.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{performer.department}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{performer.attendance}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span>{performer.rating}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Frequent Late Comers */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Frequent Late Comers</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late Count</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Delay</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {frequentLateComers.map((lateComer) => (
                        <tr key={lateComer.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{lateComer.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lateComer.department}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lateComer.lateCount}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lateComer.averageDelay}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pending Requests Table */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Pending Leave Requests</h2>
                <button className="text-sm text-indigo-600 hover:text-indigo-900">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.days}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.startDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-900">
                              <Check size={18} />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab (Simplified) */}
        {selectedTab === 'requests' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">All Leave Requests</h2>
            <p className="text-gray-500 mb-4">This section will contain a detailed view of all leave requests with filtering options</p>
          </div>
        )}

        {/* Performance Tab (Simplified) */}
        {selectedTab === 'performance' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Employee Performance Analytics</h2>
            <p className="text-gray-500 mb-4">This section will contain detailed performance metrics and attendance analytics</p>
          </div>
        )}

        {/* Employees Tab (Simplified) */}
        {selectedTab === 'employees' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Staff Record</h2>
            <p className="text-gray-500 mb-4">This section will contain detailed employee records and leave history</p>
          </div>
        )}
      </main>
    </div>
  );
}