import AttendanceTable from "@/components/Attendance/ViewAttendance";
import React from "react";
import { attendanceData } from "@/components/Attendance/ViewAttendance";
import { Header } from "@/components/dashboard/Header";

const page = () => {
  return (
    <div className="w-full h-screen overflow-y-hidden bg-bg-light-secondary dark:bg-bg-dark-primary">
      <div className="pt-2 pl-2 pr-2">
        <Header value="View Attendance" />
      </div>
      <AttendanceTable data={attendanceData} />
    </div>
  );
};

export default page;
