"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { ClassNameAPI as API } from "@/api/Classname/ClassNameAPI";
import { AttendanceTimeAPI as API1 } from "@/api/AttendaceTime/attendanceTimeAPI";
import { TeacherNameAPI as API2 } from "@/api/Teacher/TeachetAPI";
import { StudentAPI as API3 } from "@/api/Student/StudentsAPI";
import { Select, SelectOption as SelectComponentOption } from "../Select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "../Loader";
import { AttendanceAPI } from "@/api/Attendance/AttendanceAPI";
import { MarkAttInput } from "@/models/markattendace/markattendance";

type Attendance = {
  id: string;
  name: string;
  present: boolean;
  absent: boolean;
  late: boolean;
  sick: boolean;
};

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

export interface SelectOption {
  id: string | number;
  [key: string]: string | number;
}

const MarkAttendance = () => {
  const [classNameList, setClassNameList] = useState<SelectComponentOption[]>(
    []
  );
  const [classTimeList, setClassTimeList] = useState<SelectComponentOption[]>(
    []
  );
  const [teacherNameList, setTeacherNameList] = useState<
    SelectComponentOption[]
  >([]);
  const [data, setData] = useState<Attendance[]>([]);
  const [studentByFilter, setStudentByFilter] = useState<
    SelectComponentOption[]
  >([]);
  const [isLoading, setLoading] = useState(false);

  <Loader isActive={isLoading} />;
  useEffect(() => {
    GetClassName();
    GetClassTime();
    GetTeacherName();
  }, []);

  useEffect(() => {
    setData(
      studentByFilter.map((student) => ({
        id: student.id.toString(),
        name: student.title.toString(),
        present: false,
        absent: false,
        late: false,
        sick: false,
      }))
    );
  }, [studentByFilter]);

  const GetClassName = async () => {
    try {
      setLoading(true);
      const response = (await API.Get()) as { data: ClassNameResponse[] };
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
  };

  const GetClassTime = async () => {
    try {
      setLoading(true);
      const response = (await API1.Get()) as { data: AttendanceTimeResponse[] };
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
    setLoading(false);
  };

  const GetTeacherName = async () => {
    try {
      setLoading(true);
      const response = (await API2.Get()) as unknown as {
        data: TeacherResponse[];
      };
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

    setLoading(false);
  };

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<MarkAttInput>();

  const columnHelper = createColumnHelper<Attendance>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Student Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("present", {
      header: "Present",
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.present}
          onCheckedChange={(checked) => {
            const newData = [...data];
            newData[row.index].present = checked as boolean;
            if (checked) {
              newData[row.index].absent = false;
              newData[row.index].late = false;
              newData[row.index].sick = false;
            }
            setData(newData);
          }}
        />
      ),
    }),
    columnHelper.accessor("absent", {
      header: "Absent",
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.absent}
          onCheckedChange={(checked) => {
            const newData = [...data];
            newData[row.index].absent = checked as boolean;
            if (checked) {
              newData[row.index].present = false;
              newData[row.index].late = false;
              newData[row.index].sick = false;
            }
            setData(newData);
          }}
        />
      ),
    }),
    columnHelper.accessor("late", {
      header: "Late",
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.late}
          onCheckedChange={(checked) => {
            const newData = [...data];
            newData[row.index].late = checked as boolean;
            if (checked) {
              newData[row.index].present = false;
              newData[row.index].absent = false;
              newData[row.index].sick = false;
            }
            setData(newData);
          }}
        />
      ),
    }),
    columnHelper.accessor("sick", {
      header: "Sick",
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.sick}
          onCheckedChange={(checked) => {
            const newData = [...data];
            newData[row.index].sick = checked as boolean;
            if (checked) {
              newData[row.index].present = false;
              newData[row.index].absent = false;
              newData[row.index].late = false;
            }
            setData(newData);
          }}
        />
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const onSubmit = (formData: MarkAttInput) => {
    const payload = {
  attendances: [
    {
      attendance_date: "2025-02-03",
      attendance_time_id: "1",
      class_name_id: "1", 
      teacher_name_id: "1",
      student_id: studentId, // You need to include student IDs
      attendance_value_id: attendanceValue // 1 for present, 2 for absent, etc.
    }
    // ... more attendance records as needed
  ]
};

    console.log("Submitting attendance:", payload);
    try {
      const response = AttendanceAPI.Create(formData);
    } catch {
      console.error("error");
    }
  };

  const HandleSubmitForStudentGet = async (formData: MarkAttInput) => {
    try {
      const response = (await API3.GetStudentbyFilter(
        parseInt(formData.class_name_id)
      )) as { data: StudentResponse[] };
      if (response.data && Array.isArray(response.data)) {
        setStudentByFilter(
          response.data.map((item: StudentResponse) => ({
            id: item.student_id,
            title: item.student_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-5">
      <div className="ml-2 bg-white dark:bg-transparent border border-gray-200 rounded-lg w-[82.5rem] p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-32 ml-8">
            <div className="py-2">
              <label className="text-gray-700 font-bold dark:text-gray-400">
                Date
              </label>
              <Input
                type="date"
                className="border-gray-300 w-36"
                {...register("attendance_date", {
                  required: "Date is required",
                })}
              />
              <p className="text-red-500">{errors.attendance_date?.message}</p>
            </div>

            <div className="py-2 w-36">
              <Select
                label="Class Time"
                options={classTimeList}
                {...register("attendance_time_id", {
                  required: "Time is required",
                })}
                DisplayItem="title"
                className="w-full"
              />
              <p className="text-red-500">
                {errors.attendance_time_id?.message}
              </p>
            </div>

            <div className="py-2 w-36">
              <Select
                label="Class Name"
                options={classNameList}
                {...register("class_name_id", {
                  required: "Class is required",
                })}
                DisplayItem="title"
                className="w-full"
              />
              <p className="text-red-500">{errors.class_name_id?.message}</p>
            </div>

            <div className="py-2 w-36">
              <Select
                label="Teacher Name"
                options={teacherNameList}
                {...register("teacher_name_id", {
                  required: "Teacher is required",
                })}
                DisplayItem="title"
                className="w-full"
              />
              <p className="text-red-500">{errors.teacher_name_id?.message}</p>
            </div>

            <Button
              type="button"
              onClick={() => handleSubmit(HandleSubmitForStudentGet)()}
              className="mt-8 w-[6rem]"
            >
              Get
            </Button>
          </div>

          {data.length > 0 && (
            <div className="p-4 sm:p-8 bg-background">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-center">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="text-center">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit">Submit Attendance</Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MarkAttendance;
