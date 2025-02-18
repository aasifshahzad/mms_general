"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { AlertCircle, Check, CalendarIcon, Clock } from "lucide-react";
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
import { toast } from "sonner";

// Define the AttendanceRecord interface
interface AttendanceRecord {
  attendance_id: number;
  attendance_date: string;
  attendance_time: string;
  class_name: string;
  teacher_name: string;
  student_name: string;
  father_name: string;
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

const AttendanceTable: React.FC = () => {
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
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
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

  const HandleSubmitForStudentGet = async (formData: any) => {
    try {
      setIsLoading(true);
      const filter: FilteredAttendance = {
        attendance_date: formData.attendance_date || "",
        attendance_time_id: Number(formData.attendance_time_id) || 0,
        class_name_id: Number(formData.class_name_id) || 0,
        teacher_name_id: Number(formData.teacher_name_id) || 0,
        student_id: Number(formData.student_id) || 0,
        father_name: formData.father_name || "",
        attendance_value_id: Number(formData.attendance_value_id) || 0,
      };

      const response = await (API as any).GetbyFilter(filter);

      if (response.status === 200) {
        toast.success("Data fetched successfully", {
          position: "bottom-center",
          duration: 3000,
        });
        setAttendanceRecords(response.data);
      } else {
        toast.error(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error fetching data", {
        position: "bottom-center",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
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
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto h-[38rem]">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="py-3 px-4 font-medium text-left">ID</th>
                <th className="py-3 px-4 font-medium text-left">Date</th>
                <th className="py-3 px-4 font-medium text-left">Time</th>
                <th className="py-3 px-4 font-medium text-left">Class</th>
                <th className="py-3 px-4 font-medium text-left">Teacher</th>
                <th className="py-3 px-4 font-medium text-left">Student</th>
                <th className="py-3 px-4 font-medium text-left">Father Name</th>
                <th className="py-3 px-4 font-medium text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
                      <p>No attendance records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr
                    key={record.attendance_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-800">
                      #{record.attendance_id.toString().padStart(4, "0")}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {new Date(record.attendance_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {record.attendance_time}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {record.class_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {record.teacher_name}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {record.student_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {record.father_name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {record.attendance_value === "present" ? (
                          <div className="flex items-center text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Present
                          </div>
                        ) : record.attendance_value === "absent" ? (
                          <div className="flex items-center text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" />
                            Absent
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Late
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
