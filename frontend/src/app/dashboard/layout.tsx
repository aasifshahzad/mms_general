import Sidebar from "@/components/dashboard/Sidebar";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="md:w-64 fixed hidden md:block ">
                <Sidebar/>
            </div>
            <div className="md:ml-64 bg-secondary dark:bg-neutral-950">
                {children}
            </div>
        </div>
    );
}

export default layout