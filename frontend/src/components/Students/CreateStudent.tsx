"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import { StudentAPI as API } from "@/api/Student/StudentsAPI";
import { CreateStudent } from "@/models/students/Student";
import { Select, SelectOption as SelectComponentOption } from "../Select";
import { ClassNameAPI as API1 } from "@/api/Classname/ClassNameAPI";

const AddNewStudent = ({ onClassAdded }: { onClassAdded: () => void }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStudent>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classNameList, setClassNameList] = useState<SelectComponentOption[]>(
    []
  );

  interface ClassNameResponse {
    class_name_id: number;
    class_name: string;
  }

  const handleFormSubmit = async (data: CreateStudent) => {
    console.log(data);
    setLoading(true);
    if (data.student_date_of_birth.length === 10) {
      data.student_date_of_birth += "T00:00:00Z";
    }
    try {
      const response = await CreateStudentAPI(data);
      if (response) {
        setOpen(false);
        reset();
        toast("Class Added Successfully!");
        onClassAdded(); // Call the function to refresh the table
      }
    } catch (error) {
      console.error("Error creating class:", error);
      toast("Failed to add class");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetClassName();
  }, []);
  const CreateStudentAPI = async (data: CreateStudent) => {
    try {
      const response = await API.Create(data);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        console.error(
          "API Error:",
          (error as { response: { data: unknown } }).response.data
        );
      } else {
        console.error("API Error:", error);
      }
      throw error;
    }
  };

  const GetClassName = async () => {
    try {
      const response = (await API1.Get()) as { data: ClassNameResponse[] };
      if (response.data) {
        setClassNameList(
          response.data.map((item) => ({
            id: item.class_name_id,
            title: item.class_name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching class names:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-end my-4  mr-2">
        <Button
          onClick={() => setOpen(true)}
          className="bg-primary dark:bg-transparent dark:border dark:border-white text-white hover:bg-blue-600 dark:hover:bg-zinc-900"
        >
          + Create
        </Button>
      </div>
      {/* Dialog for the form */}
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            {/* Dialog Title */}
            <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Add Student
            </DialogTitle>
            <hr className="bg-gray-400 dark:bg-gray-200" />

            <DialogDescription>
              {/* Form starts here */}
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="dark:bg-card dark:text-card-foreground max-w-4xl mx-auto"
              >
                <div className="py-2 w-36">
                  <Select
                    label="Class Name"
                    options={classNameList}
                    {...register("student_class_name")}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                      register("student_class_name").onChange({
                        target: { value: event.target.value },
                      });
                    }}
                    DisplayItem="title"
                    className="w-full"
                  />
                  <p className="text-red-500">
                    {errors.student_class_name?.message}
                  </p>
                </div>
                {/* Student Name and Father Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Student Name
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Full Name"
                      {...register("student_name", {
                        required: "Field is required",
                      })} // Student name field
                    />
                    <p className="text-red-500">
                      {errors.student_name?.message}
                    </p>{" "}
                    {/* Error message for student name */}
                  </div>

                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Father Name
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Father Name"
                      {...register("father_name", {
                        required: "Field is required",
                      })} // Father name field
                    />
                    <p className="text-red-500">
                      {errors.father_name?.message}
                    </p>{" "}
                    {/* Error message for father name */}
                  </div>
                </div>

                {/* Age and Date of Birth Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Age
                    </label>
                    <Input
                      type="number"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Age"
                      {...register("student_age", {
                        required: "Field is required",
                      })} // Age field
                    />
                    <p className="text-red-500">
                      {errors.student_age?.message}
                    </p>{" "}
                    {/* Error message for age */}
                  </div>

                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      {...register("student_date_of_birth", {
                        required: "Field is required",
                      })} // Date of Birth field
                    />
                    <p className="text-red-500">
                      {errors.student_date_of_birth?.message}
                    </p>{" "}
                    {/* Error message for Date of Birth */}
                  </div>
                </div>

                {/* Cast and City Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Father Cast
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Cast"
                      {...register("father_cast_name", {
                        required: "Field is required",
                      })} // Cast field
                    />
                    <p className="text-red-500">
                      {errors.father_cast_name?.message}
                    </p>{" "}
                    {/* Error message for cast */}
                  </div>

                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      City
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter City"
                      {...register("student_city", {
                        required: "Field is required",
                      })} // City field
                    />
                    <p className="text-red-500">
                      {errors.student_city?.message}
                    </p>{" "}
                    {/* Error message for city */}
                  </div>
                </div>

                {/* Gender and Education Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Gender
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Gender"
                      {...register("student_gender", {
                        required: "Field is required",
                      })} // Gender field
                    />
                    <p className="text-red-500">
                      {errors.student_gender?.message}
                    </p>{" "}
                  </div>
                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Father&apos;s Cnic
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Education"
                      {...register("father_cnic", {
                        required: "Field is required",
                      })}
                    />
                    <p className="text-red-500">
                      {errors.father_cnic?.message}
                    </p>{" "}
                    {/* Error message for Father's Cnic */}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Education
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Father Occupation"
                      {...register("student_education", {
                        required: "Field is required",
                      })} // Father's occupation field
                    />
                    <p className="text-red-500">
                      {errors.student_education?.message}
                    </p>{" "}
                    {/* Error message for father's occupation */}
                  </div>

                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Father Contact
                    </label>
                    <Input
                      type="number"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Father Contact"
                      {...register("father_contact", {
                        required: "Field is required",
                      })} // Father's contact field
                    />
                    <p className="text-red-500">
                      {errors.father_contact?.message}
                    </p>{" "}
                    {/* Error message for father's contact */}
                  </div>
                </div>
                {/* Father's Occupation and Address Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Father Occupation
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Father Occupation"
                      {...register("father_occupation", {
                        required: "Field is required",
                      })} // Father's occupation field
                    />
                    <p className="text-red-500">
                      {errors.father_occupation?.message}
                    </p>{" "}
                    {/* Error message for father's occupation */}
                  </div>

                  <div className="py-2">
                    <label className="text-gray-700 dark:text-gray-400">
                      Address
                    </label>
                    <Input
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter Father Contact"
                      {...register("student_address", {
                        required: "Field is required",
                      })} // Father's contact field
                    />
                    <p className="text-red-500">
                      {errors.student_address?.message}
                    </p>{" "}
                    {/* Error message for father's contact */}
                  </div>
                </div>

                {/* Form Buttons: Cancel and Save */}
                <div className="flex justify-end gap-4 mt-5">
                  <Button
                    type="button"
                    onClick={() => setOpen(false)}
                    variant="ghost"
                    className="bg-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:bg-secondary dark:hover:bg-gray-800"
                  >
                    Cancel {/* Cancel button */}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary dark:bg-transparent dark:border dark:border-white text-white hover:bg-blue-600 dark:hover:bg-zinc-900"
                  >
                    {loading ? <LoaderIcon className="animate-spin" /> : "Save"}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewStudent;
