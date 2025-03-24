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
import { ClassNameAPI as API } from "@/api/Classname/ClassNameAPI";
import ClassName from "@/components/ClassName/CreateClass";
import { format } from "date-fns";
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
import { ClassNameModel } from "@/models/className/className";
import { useEffect, useState } from "react";

const columns: ColumnDef<ClassNameModel>[] = [
  {
    accessorKey: "class_name_id",
    header: "Sr. No",
    cell: ({ row }) => <div className="font-semibold text-gray-700">{row.getValue("class_name_id")}</div>,
  },
  {
    accessorKey: "class_name",
    header: "Class Name",
    cell: ({ row }) => <div className="text-gray-600 font-medium">{row.getValue("class_name")}</div>,
  },
  {
    accessorKey: "created_at",
    header: "Created Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const formattedDate = format(date, "dd/MM/yyyy");
      return <div className="text-gray-500">{formattedDate}</div>;
    },
  },
];

export default function ModernStudentTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [data, setData] = useState<ClassNameModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetData();
  }, []);

  const GetData = async () => {
    setLoading(true);
    try {
      const response = await API.Get() as { data: ClassNameModel[] };
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
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg m-3 w-[98%]">
      <ClassName onClassAdded={GetData} />
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search Class..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <Table>
          <TableHeader className="bg-primary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-3 text-white">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6">
                  <LoaderIcon className="animate-spin w-6 h-6 mx-auto" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow key={row.id} className={`${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-colors duration-200`}>                  
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-gray-500 py-6">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4 text-gray-600 text-sm">
        <span>
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} - {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} students
        </span>
        <div className="flex space-x-2">
          <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-2 rounded-full bg-primary text-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-2 rounded-full primary text-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
