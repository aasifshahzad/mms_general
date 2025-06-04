"use client";
// pages/admin/dashboard.js
import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { DashboardAPI } from "@/api/Dashboard/dashboardAPI";
import { useEffect } from "react";
import {
  CardsSkeleton,
  ChartSkeleton,
  Skeleton,
} from "@/components/dashboard/Skeleton";
import { Header } from "@/components/dashboard/Header";

interface UserRolesData {
  summary: {
    Roll: string;
    Total: number;
  }[];
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string;
      borderWidth: number;
    }[];
    title: string;
  };
}

interface StudentSummaryData {
  summary: {
    total_students: number;
    present: number;
    absent: number;
    late: number;
    sick: number;
    leave: number;
  };
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
    title: string;
  };
}
interface AttendanceSummaryData {
  summary: {
    date: string;
    class_name: string;
    attendance_values: {
      Present: number;
      Absent: number;
      Late: number;
      Sick: number;
      Leave: number;
    };
  }[];
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string | null;
      borderWidth: number | null;
    }[];
    title: string;
  };
}
interface IncomeExpenseSummaryData {
  year: number;
  monthly_data: {
    [key: string]: {
      income: number;
      expense: number;
      profit: number;
    };
  };
  month_names: string[];
  totals: {
    income: number;
    expense: number;
    profit: number;
  };
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string | string[];
      borderColor: string | string[];
      borderWidth: number;
    }[];
    title: string;
  };
}
interface FeeSummaryData {
  year: number;
  monthly_data: {
    [key: string]: number;
  };
  total: number;
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
    title: string;
  };
}
interface IncomeSummaryData {
  summary: {
    year: number;
    month: number;
    category_summary: {
      [category: string]: number;
    };
  }[];
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
    title: string;
  };
  total: number;
}
interface ExpenseSummaryData {
  summary: {
    year: number;
    month: number;
    category_summary: {
      [category: string]: number;
    };
  }[];
  graph: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
    title: string;
  };
  total: number;
}

// Mock data

const monthlyTrendData = [
  { name: "Jan", leaves: 12 },
  { name: "Feb", leaves: 15 },
  { name: "Mar", leaves: 18 },
  { name: "Apr", leaves: 14 },
  { name: "May", leaves: 22 },
  { name: "Jun", leaves: 28 },
];

const pendingRequests = [
  {
    id: 1,
    name: "Ahmed Ali",
    department: "IT",
    type: "Annual",
    days: 3,
    startDate: "25-Apr-2025",
  },
  {
    id: 2,
    name: "Fatima Khan",
    department: "Marketing",
    type: "Sick",
    days: 2,
    startDate: "26-Apr-2025",
  },
  {
    id: 3,
    name: "Bilal Ahmad",
    department: "Finance",
    type: "Casual",
    days: 1,
    startDate: "28-Apr-2025",
  },
];

const todayAbsentees = [
  { id: 1, name: "Sara Malik", department: "HR", type: "Annual" },
  { id: 2, name: "Usman Khan", department: "IT", type: "Sick" },
  { id: 3, name: "Ayesha Siddiqui", department: "Marketing", type: "Casual" },
];

const topPerformers = [
  {
    id: 1,
    name: "Zainab Akhtar",
    department: "IT",
    attendance: "99%",
    productivity: "97%",
    rating: 5,
  },
  {
    id: 2,
    name: "Hamza Malik",
    department: "Finance",
    attendance: "98%",
    productivity: "96%",
    rating: 5,
  },
  {
    id: 3,
    name: "Nadia Khan",
    department: "Marketing",
    attendance: "97%",
    productivity: "95%",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Omar Farooq",
    department: "Operations",
    attendance: "96%",
    productivity: "94%",
    rating: 4.8,
  },
];

const topLeaveEmployees = [
  {
    id: 1,
    name: "Ali Hassan",
    department: "Marketing",
    leavesTaken: 7,
    leaveType: "Sick",
  },
  {
    id: 2,
    name: "Saima Jabeen",
    department: "HR",
    leavesTaken: 5,
    leaveType: "Annual",
  },
  {
    id: 3,
    name: "Tariq Mehmood",
    department: "IT",
    leavesTaken: 4,
    leaveType: "Casual",
  },
  {
    id: 4,
    name: "Farah Ahmad",
    department: "Operations",
    leavesTaken: 3,
    leaveType: "Annual",
  },
  {
    id: 5,
    name: "Imran Sheikh",
    department: "Finance",
    leavesTaken: 3,
    leaveType: "Sick",
  },
];

const recentLeaveRequests = [
  {
    id: 1,
    name: "Ahmed Khan",
    department: "IT",
    type: "Casual",
    days: 1,
    status: "Approved",
    date: "18-Apr-2025",
  },
  {
    id: 2,
    name: "Sana Rafiq",
    department: "HR",
    type: "Sick",
    days: 2,
    status: "Pending",
    date: "17-Apr-2025",
  },
  {
    id: 3,
    name: "Kashif Ali",
    department: "Marketing",
    type: "Annual",
    days: 5,
    status: "Approved",
    date: "16-Apr-2025",
  },
  {
    id: 4,
    name: "Rabia Iqbal",
    department: "Finance",
    type: "Sick",
    days: 3,
    status: "Rejected",
    date: "15-Apr-2025",
  },
];

const frequentLateComers = [
  {
    id: 1,
    name: "Asad Mahmood",
    department: "Operations",
    lateCount: 8,
    averageDelay: "22 mins",
  },
  {
    id: 2,
    name: "Hina Ali",
    department: "Marketing",
    lateCount: 6,
    averageDelay: "17 mins",
  },
  {
    id: 3,
    name: "Faisal Khan",
    department: "IT",
    lateCount: 5,
    averageDelay: "15 mins",
  },
  {
    id: 4,
    name: "Samreen Zaidi",
    department: "HR",
    lateCount: 4,
    averageDelay: "12 mins",
  },
];
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};
export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  // Add state for user roles data
  const [userRolesData, setUserRolesData] = useState<UserRolesData | null>(
    null
  );
  const [studentSummaryData, setStudentSummaryData] =
    useState<StudentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentSummaryLoading, setStudentSummaryLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [attendanceSummaryData, setAttendanceSummaryData] =
    useState<AttendanceSummaryData | null>(null);
  const [attendanceSummaryLoading, setAttendanceSummaryLoading] =
    useState(true);
  const [incomeExpenseSummaryData, setIncomeExpenseSummaryData] =
    useState<IncomeExpenseSummaryData | null>(null);
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [feeSummaryData, setFeeSummaryData] = useState<FeeSummaryData | null>(
    null
  );
  const [feeSummaryLoading, setFeeSummaryLoading] = useState(true);
  const [incomeSummaryData, setIncomeSummaryData] =
    useState<IncomeSummaryData | null>(null);
  const [incomeSummaryLoading, setIncomeSummaryLoading] = useState(true);
  const [expenseSummaryData, setExpenseSummaryData] =
    useState<ExpenseSummaryData | null>(null);
  const [expenseSummaryLoading, setExpenseSummaryLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedExpenseMonth, setSelectedExpenseMonth] = useState<
    number | null
  >(null);
  const monthNames = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  // Fetch user roles data when component mounts
  useEffect(() => {
    const fetchUserRolesData = async () => {
      try {
        const response: any = await DashboardAPI.GetUserRoles();
        if (response && response.data) {
          setUserRolesData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user roles data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRolesData();
  }, []);
  useEffect(() => {
    const fetchStudentSummaryData = async () => {
      setStudentSummaryLoading(true);
      try {
        const response: any = await DashboardAPI.GetStudentSummary(
          selectedDate
        );
        if (response && response.data) {
          setStudentSummaryData(response.data);
        }
      } catch (error) {
        console.error("Error fetching student summary data:", error);
      } finally {
        setStudentSummaryLoading(false);
      }
    };

    fetchStudentSummaryData();
  }, [selectedDate]);
  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      setAttendanceSummaryLoading(true);
      try {
        const response: any = await DashboardAPI.GetAttendanceSummary();
        if (response && response.data) {
          setAttendanceSummaryData(response.data);
        }
      } catch (error) {
        console.error("Error fetching attendance summary:", error);
      } finally {
        setAttendanceSummaryLoading(false);
      }
    };

    fetchAttendanceSummary();
  }, []);
  useEffect(() => {
    const fetchIncomeExpenseSummary = async () => {
      setIncomeExpenseLoading(true);
      try {
        const response: any = await DashboardAPI.GetIncomeExpenseSummary(
          selectedYear
        );
        if (response && response.data) {
          setIncomeExpenseSummaryData(response.data);
        }
      } catch (error) {
        console.error("Error fetching income expense summary:", error);
      } finally {
        setIncomeExpenseLoading(false);
      }
    };

    fetchIncomeExpenseSummary();
  }, [selectedYear]);
  useEffect(() => {
    const fetchFeeSummary = async () => {
      setFeeSummaryLoading(true);
      try {
        const response: any = await DashboardAPI.GetFeeSummary(selectedYear);
        if (response && response.data) {
          setFeeSummaryData(response.data);
        }
      } catch (error) {
        console.error("Error fetching fee summary:", error);
      } finally {
        setFeeSummaryLoading(false);
      }
    };

    fetchFeeSummary();
  }, [selectedYear]);
  useEffect(() => {
    const fetchIncomeSummary = async () => {
      setIncomeSummaryLoading(true);
      try {
        const response: any = await DashboardAPI.GetIncomeSummary(
          selectedYear,
          selectedMonth === null ? undefined : selectedMonth
        );
        if (response && response.data) {
          setIncomeSummaryData(response.data);
        }
      } catch (error) {
        console.error("Error fetching income summary:", error);
      } finally {
        setIncomeSummaryLoading(false);
      }
    };

    fetchIncomeSummary();
  }, [selectedYear, selectedMonth]);
  useEffect(() => {
    const fetchExpenseSummary = async () => {
      setExpenseSummaryLoading(true);
      try {
        const response: any = await DashboardAPI.GetExpenseSummary(
          selectedYear,
          selectedExpenseMonth === null ? undefined : selectedExpenseMonth
        );
        if (response && response.data) {
          setExpenseSummaryData(response.data);
        }
      } catch (error) {
        console.error("Error fetching expense summary:", error);
      } finally {
        setExpenseSummaryLoading(false);
      }
    };

    fetchExpenseSummary();
  }, [selectedYear, selectedExpenseMonth]);
  // Transform API data for the pie chart
  const transformedPieData =
    userRolesData?.graph.labels.map((label, index) => ({
      name: label,
      value: userRolesData.graph.datasets[0].data[index],
      color: userRolesData.graph.datasets[0].backgroundColor[index],
    })) || [];
  const transformedBarData =
    studentSummaryData?.graph.labels.map((label, index) => ({
      name: label,
      value: studentSummaryData.graph.datasets[0].data[index],
      color:
        studentSummaryData.graph.datasets[0].backgroundColor[index] || "#000",
    })) || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header value="Dashboard" />

      {/* Main Content */}
      <main className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setSelectedTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
          </nav>
        </div> */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {studentSummaryData?.graph.title ||
                    "Student Attendance Summary"}
                </h2>
                <div className="flex items-center">
                  <label
                    htmlFor="date-select"
                    className="mr-2 text-sm text-gray-600"
                  >
                    Select Date:
                  </label>
                  <input
                    id="date-select"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded-md px-2 py-1 text-sm"
                  />
                </div>
              </div>
              <div className="h-64">
                {studentSummaryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <ChartSkeleton />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transformedBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#8884d8">
                        {transformedBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              {studentSummaryData && (
                <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="bg-blue-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold">
                      {studentSummaryData.summary.total_students}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="font-bold">
                      {studentSummaryData.summary.present}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="font-bold">
                      {studentSummaryData.summary.absent}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-600">Late</p>
                    <p className="font-bold">
                      {studentSummaryData.summary.late}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-600">Sick</p>
                    <p className="font-bold">
                      {studentSummaryData.summary.sick}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-md text-center">
                    <p className="text-sm text-gray-600">Leave</p>
                    <p className="font-bold">
                      {studentSummaryData.summary.leave}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-6 mb-8 md:grid-cols-2">
              {/* Leave Status Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">
                  {userRolesData?.graph.title || "User Roles Overview"}
                </h2>
                <div className="h-64">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <ChartSkeleton />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={transformedPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {transformedPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              {/* Fee Summary Chart (replacing Leave Trends) */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {feeSummaryData?.graph.title || "Fee Collection Trends"}
                  </h2>
                  <div className="flex items-center">
                    <label
                      htmlFor="fee-year-select"
                      className="mr-2 text-sm text-gray-600"
                    >
                      Year:
                    </label>
                    <select
                      id="fee-year-select"
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      {/* Generate options for last 5 years and next 2 years */}
                      {Array.from(
                        { length: 7 },
                        (_, i) => currentYear - 4 + i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fee summary total */}
                {!feeSummaryLoading && feeSummaryData && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                      Total Fee Collection
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      Rs.{feeSummaryData.total.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="h-64">
                  {feeSummaryLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="mb-4 h-16 w-full rounded-md" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={
                          feeSummaryData?.graph.labels.map((month, index) => ({
                            name: month,
                            amount:
                              feeSummaryData.graph.datasets[0].data[index],
                          })) || []
                        }
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `Rs.${value}`} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          name={
                            feeSummaryData?.graph.datasets[0].label ||
                            "Fee Collection"
                          }
                          stroke={
                            feeSummaryData?.graph.datasets[0].borderColor ||
                            "#8884d8"
                          }
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Department Attendance */}

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-lg font-semibold mb-4">
                {attendanceSummaryData?.graph.title ||
                  "Class Attendance Summary"}
              </h2>
              <div className="h-80">
                {" "}
                {/* Increased height for better visibility with multiple bars */}
                {attendanceSummaryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <ChartSkeleton height="h-80" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        attendanceSummaryData?.graph.labels.map(
                          (label, index) => {
                            const dataPoint: any = { name: label };

                            // Add each attendance type as a property
                            attendanceSummaryData.graph.datasets.forEach(
                              (dataset) => {
                                dataPoint[dataset.label] = dataset.data[index];
                              }
                            );

                            return dataPoint;
                          }
                        ) || []
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {attendanceSummaryData?.graph.datasets.map((dataset) => (
                        <Bar
                          key={dataset.label}
                          dataKey={dataset.label}
                          stackId="a"
                          fill={dataset.backgroundColor}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Optional: Add a table view for detailed numbers */}
              {!attendanceSummaryLoading && attendanceSummaryData && (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Late
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sick
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceSummaryData.summary.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.class_name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.attendance_values.Present}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.attendance_values.Absent}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.attendance_values.Late}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.attendance_values.Sick}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {item.attendance_values.Leave}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {incomeExpenseSummaryData?.graph.title || "Financial Summary"}
                </h2>
                <div className="flex items-center">
                  <label
                    htmlFor="year-select"
                    className="mr-2 text-sm text-gray-600"
                  >
                    Select Year:
                  </label>
                  <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    {/* Generate options for last 5 years and next 2 years */}
                    {Array.from(
                      { length: 7 },
                      (_, i) => currentYear - 4 + i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial summary cards */}
              {!incomeExpenseLoading && incomeExpenseSummaryData && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Income
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      Rs.
                      {incomeExpenseSummaryData.totals.income.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Expense
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                      Rs.
                      {incomeExpenseSummaryData.totals.expense.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">
                      Net Profit/Loss
                    </h3>
                    <p
                      className={`text-2xl font-bold ${
                        incomeExpenseSummaryData.totals.profit >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      Rs.
                      {incomeExpenseSummaryData.totals.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="h-80">
                {incomeExpenseLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <CardsSkeleton />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        incomeExpenseSummaryData?.graph.labels.map(
                          (month, index) => ({
                            name: month,
                            Income:
                              incomeExpenseSummaryData.graph.datasets[0].data[
                                index
                              ],
                            Expense:
                              incomeExpenseSummaryData.graph.datasets[1].data[
                                index
                              ],
                            Profit:
                              incomeExpenseSummaryData.graph.datasets[2].data[
                                index
                              ],
                          })
                        ) || []
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `Rs.${value}`} />
                      <Legend />
                      <Bar
                        dataKey="Income"
                        fill={
                          typeof incomeExpenseSummaryData?.graph.datasets[0]
                            .backgroundColor === "string"
                            ? incomeExpenseSummaryData?.graph.datasets[0]
                                .backgroundColor
                            : "rgba(0, 200, 83, 0.7)"
                        }
                      />
                      <Bar
                        dataKey="Expense"
                        fill={
                          typeof incomeExpenseSummaryData?.graph.datasets[1]
                            .backgroundColor === "string"
                            ? incomeExpenseSummaryData?.graph.datasets[1]
                                .backgroundColor
                            : "rgba(244, 67, 54, 0.7)"
                        }
                      />
                      <Bar
                        dataKey="Profit"
                        fill="rgba(33, 150, 243, 0.7)"
                        // Handle array of colors for profit/loss bars
                        {...(Array.isArray(
                          incomeExpenseSummaryData?.graph.datasets[2]
                            .backgroundColor
                        ) && {
                          fill: undefined,
                          children: incomeExpenseSummaryData?.graph.labels.map(
                            (_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  Array.isArray(
                                    incomeExpenseSummaryData?.graph.datasets[2]
                                      .backgroundColor
                                  )
                                    ? incomeExpenseSummaryData?.graph
                                        .datasets[2].backgroundColor[index]
                                    : "rgba(33, 150, 243, 0.7)"
                                }
                              />
                            )
                          ),
                        })}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg font-semibold mb-2 sm:mb-0">
                  {incomeSummaryData?.graph.title || "Income Category Details"}
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center">
                    <label
                      htmlFor="income-year-select"
                      className="mr-2 text-sm text-gray-600"
                    >
                      Year:
                    </label>
                    <select
                      id="income-year-select"
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      {Array.from(
                        { length: 7 },
                        (_, i) => currentYear - 4 + i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label
                      htmlFor="income-month-select"
                      className="mr-2 text-sm text-gray-600"
                    >
                      Month:
                    </label>
                    <select
                      id="income-month-select"
                      value={selectedMonth === null ? 0 : selectedMonth}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setSelectedMonth(value === 0 ? null : value);
                      }}
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Income summary total */}
              {!incomeSummaryLoading && incomeSummaryData && (
                <div className="mb-4 bg-green-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    Total Income{" "}
                    {selectedMonth ? `for ${monthNames[selectedMonth]}` : ""}{" "}
                    {selectedYear}
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    Rs.{incomeSummaryData.total.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="h-80">
                {incomeSummaryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="mb-4 h-16 w-full rounded-md" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        incomeSummaryData?.graph.labels.map(
                          (category, index) => ({
                            name: category,
                            amount:
                              incomeSummaryData.graph.datasets[0].data[index],
                          })
                        ) || []
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `Rs.${value}`} />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name={
                          incomeSummaryData?.graph.datasets[0].label || "Income"
                        }
                        fill={
                          incomeSummaryData?.graph.datasets[0]
                            .backgroundColor || "rgba(0, 200, 83, 0.7)"
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg font-semibold mb-2 sm:mb-0">
                  {expenseSummaryData?.graph.title ||
                    "Expense Category Details"}
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center">
                    <label
                      htmlFor="expense-year-select"
                      className="mr-2 text-sm text-gray-600"
                    >
                      Year:
                    </label>
                    <select
                      id="expense-year-select"
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      {Array.from(
                        { length: 7 },
                        (_, i) => currentYear - 4 + i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label
                      htmlFor="expense-month-select"
                      className="mr-2 text-sm text-gray-600"
                    >
                      Month:
                    </label>
                    <select
                      id="expense-month-select"
                      value={
                        selectedExpenseMonth === null ? 0 : selectedExpenseMonth
                      }
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setSelectedExpenseMonth(value === 0 ? null : value);
                      }}
                      className="border rounded-md px-2 py-1 text-sm"
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Expense summary total */}
              {!expenseSummaryLoading && expenseSummaryData && (
                <div className="mb-4 bg-red-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    Total Expenses{" "}
                    {selectedExpenseMonth
                      ? `for ${monthNames[selectedExpenseMonth]}`
                      : ""}{" "}
                    {selectedYear}
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    Rs.{expenseSummaryData.total.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="h-80">
                {expenseSummaryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="mb-4 h-16 w-full rounded-md" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        expenseSummaryData?.graph.labels.map(
                          (category, index) => ({
                            name: category,
                            amount:
                              expenseSummaryData.graph.datasets[0].data[index],
                          })
                        ) || []
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `Rs.${value}`} />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name={
                          expenseSummaryData?.graph.datasets[0].label ||
                          "Expense"
                        }
                        fill={
                          expenseSummaryData?.graph.datasets[0]
                            .backgroundColor || "rgba(244, 67, 54, 0.7)"
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}
