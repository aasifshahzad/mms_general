// "use client";
// import { IncomeCategory, ViewExpenseModel } from "@/models/income/income";
// import React, { useEffect, useState } from "react";
// import { IncomeAPI as API } from "@/api/Income/IncomeAPI";
// import { useForm } from "react-hook-form";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"; // Adjust the import path based on your project structure
// import { Header } from "../dashboard/Header";

// const ViewExpense = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//   } = useForm<any>();
//   const [isLoading, setIsLoading] = useState(false);
//   const [incomeCategory, setIncomeCategory] = useState<IncomeCategory[]>([]);
//   const [incomeData, setIncomeData] = useState<any[]>([]); // State to store income data

//   useEffect(() => {
//     getCategories();
//   }, []);

//   const getCategories = async () => {
//     setIsLoading(true);
//     try {
//       const res: any = await API.GetIncomeCategory();
//       const data = res.data.map((item: IncomeCategory) => ({
//         income_cat_name_id: item.income_cat_name_id,
//         income_cat_name: item.income_cat_name,
//       }));
//       setIncomeCategory(data);
//     } catch (error) {
//       console.error("Error fetching income categories:", error);
//       setIncomeCategory([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getIncome = async (CategoryId: number) => {
//     setIsLoading(true);
//     try {
//       const res: any = await API.GetIncomeData(CategoryId); // Pass CategoryId to the API
//       setIncomeData(res.data); // Store the income data in state
//     } catch (error) {
//       console.error("Error fetching income data:", error);
//       setIncomeData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <Header value="View Income" />
//       <form className="space-y-4 border w-full my-2">
//         <div className="space-y-4 px-2 rounded-md">
//           <label className="font-bold text-sm dark:text-gray-300">
//             Category:{" "}
//           </label>
//           <select
//             {...register("category_id", {
//               valueAsNumber: true,
//               required: "Category is required",
//             })}
//             className="w-[14rem] border bg-white rounded-md px-3 py-2 focus:ring focus:ring-indigo-300 dark:bg-background dark:text-gray-300"
//             onChange={(e) => getIncome(Number(e.target.value))} // Call getIncome with selected income_cat_name_id
//           >
//             <option disabled selected value="">
//               Select Category
//             </option>
//             {incomeCategory.map((category) => (
//               <option
//                 key={category.income_cat_name_id}
//                 value={category.income_cat_name_id}
//               >
//                 {category.income_cat_name}
//               </option>
//             ))}
//           </select>
//           <p className="text-red-500 text-xs">
//             {typeof errors.category_id?.message === "string" &&
//               errors.category_id?.message}
//           </p>
//         </div>
//       </form>

//       {/* Table to display income data */}
//       <div className="mt-4 bg-white dark:bg-background rounded-md">
//         {incomeData.length > 0 ? (
//           <Table>
//             <TableHeader className="bg-primary dark:bg-secondary hover:bg-none">
//               <TableRow>
//                 <TableHead className="text-gray-100">ID</TableHead>
//                 <TableHead className="text-gray-100">Date</TableHead>
//                 <TableHead className="text-gray-100">Category</TableHead>
//                 <TableHead className="text-gray-100">Source</TableHead>
//                 <TableHead className="text-gray-100">Description</TableHead>
//                 <TableHead className="text-gray-100">Contact</TableHead>
//                 <TableHead className="text-gray-100">Amount</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {incomeData.map((item) => (
//                 <TableRow className="h-[1rem]" key={item.id}>
//                   <TableCell>{item.id}</TableCell>
//                   <TableCell>{item.date}</TableCell>
//                   <TableCell>{item.category}</TableCell>
//                   <TableCell>{item.source}</TableCell>
//                   <TableCell>{item.description}</TableCell>
//                   <TableCell>{item.contact}</TableCell>
//                   <TableCell>{item.amount}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         ) : (
//           <p>No income data available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewExpense;
