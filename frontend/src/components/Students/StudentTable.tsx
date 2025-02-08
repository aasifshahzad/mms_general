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
import { Search, ChevronLeft, ChevronRight, LoaderIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { StudentModel } from "@/models/students/Student";
import { useEffect, useState } from "react";
import AddNewStudent from "./CreateStudent";
import DelConfirmMsg from "../DelConfMsg";
import { toast } from "sonner";

const formDeleteHandler = async (confirmed: boolean, data: StudentModel & { index?: number }) => {
  const {...newData } = data;
  try {
    if (confirmed) {
      const response = await API.Delete(Number(newData.id));
      if (response && typeof response === 'object' && 'status' in response) {
        if (response.status === 200) {
          toast.success("Record deleted successfully", {
            position: "bottom-center",
          });
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
// Define columns
const columns: ColumnDef<StudentModel>[] = [
  {
    accessorKey: "id",
    header: "Sr. No",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
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
    accessorKey: "student_class_name",
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
    cell: ({ row }) => (
      <DelConfirmMsg
        rowId={row.getValue("id")}
        OnDelete={(confirmed) => formDeleteHandler(confirmed, row.original)}
      />
    )
  }
];

export default function ModernStudentTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState<StudentModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    GetData();
  }, []);

  const GetData = async () => {
    setLoading(true);
    try {
      const response = await API.Get() as { data: StudentModel[] };
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="ml-3 mt-7 p-6 w-[82rem] bg-white dark:bg-transparent dark:border-gray-100 dark:border rounded-lg shadow-lg">
      <AddNewStudent onClassAdded={GetData} />
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search Class..."
            value={globalFilter ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 rounded-full border-purple-300 focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-300"
          />
        </div>
      </div>

      {/* Table rendering */}
      <div className="rounded-md border border-purple-200 transition-shadow duration-300 hover:shadow-md h-[450px] overflow-y-auto overflow-x-auto">
        <Table className="whitespace-nowrap">
          <TableHeader className="bg-primary dark:bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-bold text-white dark:text-gray-100"
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
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`transition-colors duration-200 hover:bg-purple-50 ${
                    i % 2 === 0
                      ? "bg-white dark:bg-transparent"
                      : "bg-purple-50 dark:bg-black"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} students
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
