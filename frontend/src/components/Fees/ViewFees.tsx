"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "../Select";
import { useForm } from "react-hook-form";
import { StudentAPI as API1 } from "@/api/Student/StudentsAPI";
import { ClassNameAPI as API2 } from "@/api/Classname/ClassNameAPI";
import { FeeAPI as API3 } from "@/api/Fees/AddFeeAPI"
import { GetFeeModel} from "@/models/Fees/Fee";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Header } from "../dashboard/Header";


interface ClassNameResponse {
  class_name_id: number;
  class_name: string;
}

interface StudentResponse {
  student_id: number;
  student_name: string;
}

interface FeeData {
  fee_id: number;
  student_name: string;
  father_name: string;
  class_name: string;
  fee_amount: number;
  fee_month: string;
  fee_year: number;
  fee_status: string;
}

const ViewFees: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue: setFormValue,
    formState: { errors },
  } = useForm<GetFeeModel>();
  const [studentsList, setStudentsList] = useState<
    { id: number; title: string }[]
  >([]);
  const [classNameList, setClassNameList] = useState<
    { id: number; title: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [feesData, setFeesData] = useState<FeeData[]>([]);

  useEffect(() => {
    GetStudents();
    GetClassName();
  }, []);

  const GetStudents = async () => {
    setIsLoading(true);
    try {
      const response = (await API1.Get()) as { data: StudentResponse[] };
      setStudentsList(
        response.data.map((student) => ({
          id: student.student_id,
          title: student.student_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const GetClassName = async () => {                          
    setIsLoading(true);
    try {
      const response = (await API2.Get()) as { data: ClassNameResponse[] };
      if (response.data && Array.isArray(response.data)) {
        response.data.unshift({
          class_name_id: 0,
          class_name: "All",
        });
        setClassNameList(
          response.data.map((item: ClassNameResponse) => ({
            id: item.class_name_id,
            title: item.class_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
    } finally {
      setIsLoading(false);
    }
  };

const handleGetFees = async (data: GetFeeModel) => {
  try {
    // Use new API: class_id, fee_month, fee_year
    const response = await API3.GetClassFeeStatus({
      class_id: data.class_id,
      fee_month: data.fee_month,
      fee_year: data.fee_year,
    });

    if (Array.isArray(response.data) && response.data.length === 0) {
      toast.error("No data found");
      setFeesData([]);
    } else if (Array.isArray(response.data)) {
      setFeesData(response.data as FeeData[]);
      toast.success("Fees data fetched successfully");
    } else {
      toast.error("Unexpected response format");
    }
  } catch (error) {
    console.error("Error fetching fees:", error);
    toast.error("Failed to fetch fees");
  }
};

  return (
    <div className="container mx-auto px-2 sm:px-4">
      <Header value="View Fees" />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-3">
        <form
          onSubmit={handleSubmit(handleGetFees)}
          className="flex flex-col gap-4 sm:flex-row sm:gap-6 p-2 sm:p-3"
        >
          <div className="space-y-2 w-full sm:w-auto">
            <label className="text-sm text-gray-700 dark:text-gray-300 font-bold">
              Student
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedStudent
                    ? studentsList.find(
                        (student) => student.id.toString() === selectedStudent
                      )?.title
                    : "Select student..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search student..."
                    className="h-9"
                  />
                  <CommandList>
                    {isLoading ? (
                      <div className="p-2 text-center text-gray-500">
                        Loading...
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No student found.</CommandEmpty>
                        <CommandGroup>
                          {studentsList.map((student) => (
                            <CommandItem
                              key={student.id}
                              value={student.id.toString()}
                              onSelect={(currentValue: string) => {
                                setSelectedStudent(
                                  currentValue === selectedStudent
                                    ? ""
                                    : currentValue
                                );
                                setOpen(false);
                                setFormValue(
                                  "student_id",
                                  currentValue ? parseInt(currentValue, 10) : 0
                                );
                              }}
                            >
                              {student.title}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedStudent === student.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-red-500 text-xs">{errors.student_id?.message}</p>
          </div>
          <div className="w-full sm:w-auto">
            <Select
              label="Class Name"
              options={classNameList}
              {...register("class_id")}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Select
              label="Fee Month"
              options={[
                { id: "January", title: "January" },
                { id: "February", title: "February" },
                { id: "March", title: "March" },
                { id: "April", title: "April" },
                { id: "May", title: "May" },
                { id: "June", title: "June" },
                { id: "July", title: "July" },
                { id: "August", title: "August" },
                { id: "September", title: "September" },
                { id: "October", title: "October" },
                { id: "November", title: "November" },
                { id: "December", title: "December" },
              ]}
              {...register("fee_month")}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Select
              label="Fee Year"
              options={[
                { id: "2023", title: "2023" },
                { id: "2024", title: "2024" },
                { id: "2025", title: "2025" },
              ]}
              {...register("fee_year")}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Select
              label="Fee Status"
              options={[
                { id: "Paid", title: "Paid" },
                { id: "Unpaid", title: "Unpaid" },
              ]}
              {...register("fee_status")}
              className="w-full"
            />
          </div>
          <Button className="mt-2 sm:mt-6 w-full sm:w-auto" type="submit">
            Get
          </Button>
        </form>

        {feesData.length > 0 && (
          <div className="p-2 sm:p-4 overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Father Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feesData.map((fee) => (
                  <TableRow key={fee.fee_id}>
                    <TableCell>{fee.student_name}</TableCell>
                    <TableCell>{fee.father_name}</TableCell>
                    <TableCell>{fee.class_name}</TableCell>
                    <TableCell>{fee.fee_amount}</TableCell>
                    <TableCell>{fee.fee_month}</TableCell>
                    <TableCell>{fee.fee_year}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        fee.fee_status === "Paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {fee.fee_status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFees;
