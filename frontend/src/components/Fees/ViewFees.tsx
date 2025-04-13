"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "../Select";
import { useForm } from "react-hook-form";
import { StudentAPI as API1 } from "@/api/Student/StudentsAPI";
import { ClassNameAPI as API2 } from "@/api/Classname/ClassNameAPI";
import { FeeAPI as API3 } from "@/api/Fees/AddFeeAPI"
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

// Define the FilteredFees interface
interface FilteredFees {
  student_id: number;
  class_name_id: number;
  fee_month: string;
  fee_year: string;
  fee_status: string;
}

interface ClassNameResponse {
  class_name_id: number;
  class_name: string;
}

interface StudentResponse {
  student_id: number;
  student_name: string;
}

const ViewFees: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    setValue: setFormValue,
    formState: { errors },
  } = useForm<FilteredFees>();
  const [studentsList, setStudentsList] = useState<
    { id: number; title: string }[]
  >([]);
  const [classNameList, setClassNameList] = useState<
    { id: number; title: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");

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

  const handleGetFees = async (data: FilteredFees) => {
    try {
        const response = await API3.GetFeebyFilter();
        console.log("Fetching fees with data:", data);
        // Handle the response as needed
    } catch (error) {
        console.error("Error fetching fees:", error);
        toast.error("Failed to fetch fees");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(handleGetFees)} className="flex p-3 gap-6">
          <div className="space-y-2">
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
                                  Number(currentValue)
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
          <Select
            label="Class Name"
            options={classNameList}
            {...register("class_name_id")}
          />
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
          />
          <Select
            label="Fee Year"
            options={[
              { id: "2023", title: "2023" },
              { id: "2024", title: "2024" },
              { id: "2025", title: "2025" },
            ]}
            {...register("fee_year")}
          />
          <Select
            label="Fee Status"
            options={[
              { id: "paid", title: "Paid" },
              { id: "unpaid", title: "Unpaid" },
            ]}
            {...register("fee_status")}
          />
          <Button type="submit">Get</Button>
        </form>
      </div>
    </div>
  );
};

export default ViewFees;
