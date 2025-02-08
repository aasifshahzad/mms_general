'use client';
import type React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

// Define the AttendanceRecord interface
interface AttendanceRecord {
  attendance_id: number
  attendance_date: string
  attendance_time: string
  attendance_class: string
  attendance_teacher: string
  attendance_student: string
  attendance_std_fname: string
  attendance_value: string
}

// Sample data (in a real application, you would fetch this from an API)
export const attendanceData: AttendanceRecord[] = [
  {
    attendance_id: 14,
    attendance_date: "2025-01-21T18:39:55.222000",
    attendance_time: "Afternoon",
    attendance_class: "Class 8",
    attendance_teacher: "Teacher 1",
    attendance_student: "Ben Carter",
    attendance_std_fname: "James Carter",
    attendance_value: "leave",
  },
  {
    attendance_id: 15,
    attendance_date: "2025-01-21T19:09:25.330000",
    attendance_time: "Afternoon",
    attendance_class: "Class 8",
    attendance_teacher: "Teacher 1",
    attendance_student: "Shelly Nelson",
    attendance_std_fname: "Halla Yates",
    attendance_value: "leave",
  },
  {
    attendance_id: 16,
    attendance_date: "2025-01-21T19:09:25.330000",
    attendance_time: "Afternoon",
    attendance_class: "Class 8",
    attendance_teacher: "Teacher 1",
    attendance_student: "Shelly Nelson",
    attendance_std_fname: "Halla Yates",
    attendance_value: "leave",
  },
]

const AttendanceTable: React.FC<{ data: AttendanceRecord[] }> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const filteredData = data.filter((record) => {
    const matchesSearch = Object.values(record).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )
    const matchesDate = selectedDate
      ? new Date(record.attendance_date).toDateString() === selectedDate.toDateString()
      : true
    return matchesSearch && matchesDate
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <Input
          type="text"
          placeholder="Search..."
          className="mb-2 md:mb-0 md:mr-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-full md:w-[280px] justify-start text-left font-normal ${
                !selectedDate && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-center border-b">ID</th>
              <th className="py-2 px-4 text-center border-b">Date</th>
              <th className="py-2 px-4 text-center border-b">Time</th>
              <th className="py-2 px-4 text-center border-b">Class</th>
              <th className="py-2 px-4 text-center border-b">Teacher</th>
              <th className="py-2 px-4 text-center border-b">Student</th>
              <th className="py-2 px-4 text-center border-b">Student&apos;s Father</th>
              <th className="py-2 px-4 text-center border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record) => (
              <tr key={record.attendance_id} className="hover:bg-gray-50">
                <td className="py-2 px-4 text-center border-b">{record.attendance_id}</td>
                <td className="py-2 px-4 text-center border-b">{new Date(record.attendance_date).toLocaleDateString()}</td>
                <td className="py-2 px-4 text-center border-b">{record.attendance_time}</td>
                <td className="py-2 px-4 text-center border-b">{record.attendance_class}</td>
                <td className="py-2 px-4 text-center border-b">{record.attendance_teacher}</td>
                <td className="py-2 px-4 text-center border-b">{record.attendance_student}</td>
                <td className="py-2 px-4 text-center border-b">{record.attendance_std_fname}</td>
                <td className="py-2 px-4 text-center border-b">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.attendance_value === "present"
                        ? "bg-green-200 text-green-800"
                        : record.attendance_value === "absent"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {record.attendance_value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AttendanceTable;

