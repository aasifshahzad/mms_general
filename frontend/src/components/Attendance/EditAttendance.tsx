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
import { AttendanceAPI as API } from "@/api/Attendance/AttendanceAPI";
import { Select, SelectOption as SelectComponentOption } from "../Select";
import { ClassNameAPI as API1 } from "@/api/Classname/ClassNameAPI";
import { FaRegEdit } from "react-icons/fa";
import { Checkbox } from "../ui/checkbox";
import { MarkAttUpdate } from "@/models/markattendace/markattendance";

interface EditAttendanceProps {
  attendanceId: number;
}

const EditAttendance = ({ attendanceId}: EditAttendanceProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MarkAttUpdate>();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classNameList, setClassNameList] = useState<SelectComponentOption[]>(
    []
  );

  interface ClassNameResponse {
    class_name_id: number;
    class_name: string;
  }

  const handleFormSubmit = async (data: MarkAttUpdate) => {
    setLoading(true);
    try {
      const attendanceValue = document.querySelector('input[name="attendanceStatus"]:checked') as HTMLInputElement;
      
      const updateData: MarkAttUpdate = {
        attendance_id: attendanceId,
        attendance_value_id: getAttendanceValueId(attendanceValue.value)
      };

      const response = await UpdateAttendanceAPI(updateData);
      if (response) {
        setOpen(false);
        reset();
        toast.success("Attendance Updated Successfully!",{
            position: "bottom-center",
            duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceValueId = (value: string): number => {
    switch(value) {
      case 'present': return 1;
      case 'absent': return 2;
      case 'late': return 3;
      case 'sick': return 4;
      default: return 1;
    }
  };

  const UpdateAttendanceAPI = async (data: MarkAttUpdate) => {
    try {
      const response = await API.Update(data.attendance_id, data);
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

  return (
    <div>
      <div className="flex justify-end my-2 mr-2">
        <FaRegEdit
          onClick={() => setOpen(true)}
          className="w-4 h-4 cursor-pointer mr-8 hover:text-blue-500"
        />
      </div>
      {/* Dialog for the form */}
      <Dialog open={open}>
        <DialogContent className="dark:bg-zinc-900">
          <DialogHeader>
            {/* Dialog Title */}
            <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Edit Attendance
            </DialogTitle>
            <hr className="bg-gray-400 dark:bg-gray-600" />

            <DialogDescription>
              {/* Form starts here */}
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="dark:bg-zinc-900 dark:text-gray-100"
              >
                <div className="space-y-2">
                  <div className="flex justify-center items-center space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="attendanceStatus"
                        className="form-radio h-4 w-4 text-blue-600"
                        value="present"
                        defaultChecked
                      />
                      <span className="ml-2">Present</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="attendanceStatus"
                        className="form-radio h-4 w-4 text-red-600"
                        value="absent"
                      />
                      <span className="ml-2">Absent</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="attendanceStatus"
                        className="form-radio h-4 w-4 text-yellow-600"
                        value="late"
                      />
                      <span className="ml-2">Late</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="attendanceStatus"
                        className="form-radio h-4 w-4 text-green-600"
                        value="sick"
                      />
                      <span className="ml-2">Sick</span>
                    </label>
                  </div>
                </div>

                {/* Form Buttons: Cancel and Save */}
                <div className="flex justify-end gap-4 mt-5">
                  <Button
                    type="button"
                    onClick={() => setOpen(false)}
                    variant="ghost"
                    className="bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-zinc-700"
                  >
                    Cancel {/* Cancel button */}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary dark:bg-transparent dark:border dark:border-white text-white hover:bg-blue-600 dark:hover:bg-zinc-800"
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

export default EditAttendance;
