"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectOption as SelectComponentOption } from "../Select";
import { useForm } from "react-hook-form";
import { AttendanceAPI as API } from "@/api/Attendance/AttendanceAPI";
import { ClassNameAPI as API2 } from "@/api/Classname/ClassNameAPI";
import { AttendanceTimeAPI as API13 } from "@/api/AttendaceTime/attendanceTimeAPI";
import { TeacherNameAPI as API4 } from "@/api/Teacher/TeachetAPI";

// Define the AttendanceRecord interface
interface AttendanceRecord {
  attendance_id: number;
  attendance_date: string;
  attendance_time: string;
  attendance_class: string;
  attendance_teacher: string;
  attendance_student: string;
  attendance_std_fname: string;
  attendance_value: string;
}

interface StudentResponse {
  student_id: number;
  student_name: string;
}

interface FilteredAttendance {
  attendance_date: string;
  attendance_time_id: number;
  class_name_id: number;
  teacher_name_id: number;
  student_id: number;
  father_name: string;
  attendance_value_id: number;
}

interface ClassNameResponse {
  class_name_id: number;
  class_name: string;
}

interface AttendanceTimeResponse {
  attendance_time_id: number;
  attendance_time: string;
}

interface TeacherResponse {
  teacher_name_id: number;
  teacher_name: string;
}

interface StudentResponse {
  student_id: number;
  student_name: string;
}

// type for the API function
interface AttendanceAPI {
  GetbyFilter: (filter: FilteredAttendance) => Promise<any>;
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
];

const AttendanceTable: React.FC<{ data: AttendanceRecord[] }> = ({ data }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [studentByFilter, setStudentByFilter] = useState<
    Array<{ id: number; title: string }>
  >([]);
  const [classTimeList, setClassTimeList] = useState<SelectComponentOption[]>(
    []
  );
  const [classNameList, setClassNameList] = useState<SelectComponentOption[]>(
    []
  );
  const [teacherNameList, setTeacherNameList] = useState<
    SelectComponentOption[]
  >([]);

  useEffect(() => {
    // Load dropdown data here
    GetClassName();
    GetClassTime();
    GetTeacherName();
  }, []);

  const GetClassName = async () => {
    try {
      setIsLoading(true);
      const response = (await API2.Get()) as { data: ClassNameResponse[] };
      response.data.unshift({
        class_name_id: 0,
        class_name: "All",
      });
      if (response.data && Array.isArray(response.data)) {
        setClassNameList(
          response.data.map((item: ClassNameResponse) => ({
            id: item.class_name_id,
            title: item.class_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
    }
    setIsLoading(false);
  };

  const GetClassTime = async () => {
    try {
      setIsLoading(true);
      const response = (await API13.Get()) as {
        data: AttendanceTimeResponse[];
      };
      response.data.unshift({
        attendance_time_id: 0,
        attendance_time: "All",
      });
      if (response.data && Array.isArray(response.data)) {
        setClassTimeList(
          response.data.map((item: AttendanceTimeResponse) => ({
            id: item.attendance_time_id,
            title: item.attendance_time,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching class times:", error);
    }
    setIsLoading(false);
  };

  const GetTeacherName = async () => {
    try {
      setIsLoading(true);
      const response = (await API4.Get()) as unknown as {
        data: TeacherResponse[];
      };
      response.data.unshift({
        teacher_name_id: 0,
        teacher_name: "All",
      });
      if (response.data && Array.isArray(response.data)) {
        setTeacherNameList(
          response.data.map((item: TeacherResponse) => ({
            id: item.teacher_name_id,
            title: item.teacher_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }

    setIsLoading(false);
  };

  const filteredData = data.filter((record) => {
    const matchesSearch = Object.values(record).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesDate = selectedDate
      ? new Date(record.attendance_date).toDateString() ===
        selectedDate.toDateString()
      : true;
    return matchesSearch && matchesDate;
  });

  const HandleSubmitForStudentGet = async (formData: any) => {
    try {
      setIsLoading(true);
      
      // Create filter object only with valid values
      const filter: FilteredAttendance = {
        attendance_date: formData.attendance_date || '',
        attendance_time_id: Number(formData.attendance_time_id) || 0,
        class_name_id: Number(formData.class_name_id) || 0,
        teacher_name_id: Number(formData.teacher_name_id) || 0,
        student_id: Number(formData.student_id) || 0,
        father_name: formData.father_name || '',
        attendance_value_id: Number(formData.attendance_value_id) || 0
      };
  
      console.log('Filtered payload:', filter);
      
      const response = await (API as any).GetbyFilter(filter);
      if (response.data && Array.isArray(response.data)) {
        setStudentByFilter(
          response.data.map((item: StudentResponse) => ({
            id: item.student_id,
            title: item.student_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
      <form onSubmit={handleSubmit(HandleSubmitForStudentGet)}>
        <div className="flex gap-32 ml-8">
          <div className="py-2">
            <label className="text-gray-700 font-bold dark:text-gray-400">
              Date
            </label>
            <Input
              type="date"
              className="border-gray-300 w-36"
              {...register("attendance_date", {})}
            />
            <p className="text-red-500">
              {errors.attendance_date?.message?.toString()}
            </p>
          </div>

          <div className="py-2 w-36">
            <Select
              label="Class Time"
              options={classTimeList}
              {...register("attendance_time_id", {
                valueAsNumber: true,
              })}
              DisplayItem="title"
              className="w-full"
              defaultValue="" // Add this line
            >
              <option value="" disabled>
                Select Class Time...
              </option>
            </Select>
            <p className="text-red-500">
              {errors.attendance_time_id?.message?.toString()}
            </p>
          </div>
          <div className="py-2 w-36">
            <Select
              label="Class Name"
              options={classNameList}
              {...register("class_name_id", {
                valueAsNumber: true,
              })}
              DisplayItem="title"
              className="w-full"
            />
            <p className="text-red-500">
              {errors.class_name_id?.message?.toString()}
            </p>
          </div>

          <div className="py-2 w-36">
            <Select
              label="Teacher Name"
              options={teacherNameList}
              {...register("teacher_name_id", {
                valueAsNumber: true,
              })}
              DisplayItem="title"
              className="w-full"
            />
            <p className="text-red-500">
              {errors.teacher_name_id?.message?.toString()}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Search"}
        </Button>
      </form>
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
              <th className="py-2 px-4 text-center border-b">
                Student&apos;s Father
              </th>
              <th className="py-2 px-4 text-center border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No records found
                </td>
              </tr>
            ) : (
              filteredData.map((record) => (
                <tr key={record.attendance_id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 text-center border-b">
                    {record.attendance_id}
                  </td>
                  <td className="py-2 px-4 text-center border-b">
                    {new Date(record.attendance_date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 text-center border-b">
                    {record.attendance_time}
                  </td>
                  <td className="py-2 px-4 text-center border-b">
                    {record.attendance_class}
                  </td>
                  <td className="py-2 px-4 text-center border-b">
                    {record.attendance_teacher}
                  </td>
                  <td className="py-2 px-4 text-center border-b">
                    {record.attendance_student}
                  </td>
                  <td className="py-2 px-4 text-center border-b">
                    {record.attendance_std_fname}
                  </td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
