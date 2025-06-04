import { Header } from "@/components/dashboard/Header";
import ModernStudentTable from "@/components/Students/StudentTable";
import React from "react";

const page = () => {
  return (
    <div className="w-full md:w-[70%] h-screen overflow-y-auto overflow-x-hidden bg-bg-light-secondary dark:bg-bg-dark-primary">
      <div className="w-screen">
        <Header value="Students List" />
      </div>
      {/* <AddNewStudent/> */}
      <ModernStudentTable />
    </div>
  );
};

export default page;