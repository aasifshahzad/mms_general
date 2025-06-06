"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, LoaderIcon } from "lucide-react";
import { StudentAPI as API } from "@/api/Student/StudentsAPI";
export { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { StudentModel } from "@/models/students/Student";
import { useEffect, useState } from "react";
import AddNewStudent from "./CreateStudent";
import DelConfirmMsg from "../DelConfMsg";
import { toast } from "sonner";
import Card  from "@/components/ui/card";
import {Pagination} from "@/components/ui/pagination";

export default function ModernStudentTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState<StudentModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Define formDeleteHandler first
  const formDeleteHandler = async (confirmed: boolean, data: StudentModel & { index?: number }) => {
    const {...newData } = data;
    try {
      if (confirmed) {
        const studentId = Number(newData.student_id);
        if (isNaN(studentId)) {
          toast.error("Invalid Student ID", {
            position: "bottom-center",
          });
          return;
        }
        const response = await API.Delete(studentId);
        if (response && typeof response === 'object' && 'status' in response) {
          if (response.status === 200) {
            toast.success("Record deleted successfully", {
              position: "bottom-center",
            });
            GetData(); // Refresh data after delete
          } else {
            toast.error("An error occurred", {
              position: "bottom-center",
            });
          }
        }
      }
    } catch (error) {
      console.log("Error on Delete", error);
    }
  };

  // Define columns after formDeleteHandler
  const columns: ColumnDef<StudentModel>[] = [
    {
      accessorKey: "student_id",
      header: "Sr. No",
      cell: ({ row }) => <div className="font-medium">{row.getValue("student_id")}</div>,
    },
    {
      accessorKey: "student_name",
      header: "Student Name",
    },
    {
      accessorKey: "student_date_of_birth",
      header: "Student Date of Birth",
      cell: ({ row }) => {
        const date = new Date(row.getValue("student_date_of_birth"));
        const formattedDate = date.toLocaleDateString("en-GB"); // Use 'en-GB' for dd/MM/yyyy
        return <div>{formattedDate}</div>;
      },
    },
    {
      accessorKey: "student_age",
      header: "Student Age",
    },
    {
      accessorKey: "student_gender",
      header: "Student Gender",
    },
    {
      accessorKey: "student_education",
      header: "Student Education",
    },
    {
      accessorKey: "class_name",
      header: "Student Class Name",
    },
    {
      accessorKey: "student_city",
      header: "Student City",
    },
    {
      accessorKey: "student_address",
      header: "Student Address",
    },
    {
      accessorKey: "father_name",
      header: "Father Name",
    },
    {
      accessorKey: "father_occupation",
      header: "Father Occupation",
    },
    {
      accessorKey: "father_cnic",
      header: "Father CNIC",
    },
    {
      accessorKey: "father_cast_name",
      header: "Father Cast Name",
    },
    {
      accessorKey: "father_contact",
      header: "Father Contact",
    },
    {
      accessorKey: "Delete",
      header: "Delete",
      cell: ({ row }) => {
        return (
          <DelConfirmMsg
            rowId={row.getValue("id")}
            OnDelete={(confirmed) => formDeleteHandler(confirmed, row.original)}
          />
        );
      }
    }
  ];

  // Fetch data from API
  const GetData = async () => {
    setLoading(true);
    try {
      const response = await API.Get() as { data: StudentModel[] };
      // console.log(response.data); // Check the API response
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <Card className="ml-3 mr-3 mt-2 p-6 w-full md:w-[80%] bg-white dark:bg-background rounded-lg shadow-lg">
      <AddNewStudent onClassAdded={GetData} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search Students..."
            value={globalFilter ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-300"
          />
        </div>
      </div>

      {/* Table rendering */}
      <div className="rounded-md border w-auto border-gray-200 transition-shadow duration-300 hover:shadow-md overflow-x-auto">
        <Table className="whitespace-nowrap scroll-smooth">
          <TableHeader className="bg-primary w-[60%] hover:bg-none text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-bold text-white"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  <div className="flex justify-center">
                    <LoaderIcon className="animate-spin w-10 h-10" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination
        className="flex mt-4"
        currentPage={table.getState().pagination.pageIndex + 1}
        totalPages={Math.ceil((table.getFilteredRowModel()?.rows.length || 0) / table.getState().pagination.pageSize)}
        onPageChange={(page) => {
          table.setPageIndex(page - 1);
        }}
      />
      <div className="flex justify-start text-sm text-gray-500 ">
        Showing{" "}
        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{" "}
        to{" "}
        {Math.min(
          (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
          table.getFilteredRowModel().rows.length
        )}{" "}
        of {table.getFilteredRowModel().rows.length} results
      </div>
    </Card>
  );
}
