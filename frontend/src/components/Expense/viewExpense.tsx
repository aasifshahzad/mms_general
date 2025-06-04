"use client";
import { ExpenseCategory, ExpenseData } from "@/models/expense/expense";
import React, { useEffect, useState } from "react";
import { ExpenseAPI as API } from "@/api/Expense/ExpenseAPI";
import { useForm } from "react-hook-form";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Adjust the import path based on your project structure
import { Header } from "../dashboard/Header";
import Loader from "../Loader";

const ViewExpense = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [ExpenseCategory, setExpenseCategory] = useState<ExpenseCategory[]>([]);
  const [ExpenseData, setExpenseData] = useState<any[]>([]); // State to store Expense data

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    setIsLoading(true);
    try {
      const res: any = await API.GetExpenseCategory();
      setExpenseCategory(res.data);
    console.log("Expense categories:", res.data);
    } catch (error) {
      console.error("Error fetching Expense categories:", error);
      setExpenseCategory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getExpense = async (CategoryId: number) => {
    setIsLoading(true);
    try {
      const res: any = await API.GetExpenseData(CategoryId); // Pass CategoryId to the API
      setExpenseData(res.data); // Store the Expense data in state
    } catch (error) {
      console.error("Error fetching Expense data:", error);
      setExpenseData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header value="View Expense" />
      <Loader isActive={isLoading} />
      <form className="space-y-4 border w-full my-2">
        <div className="space-y-4 px-2 rounded-md">
          <label className="font-bold text-sm dark:text-gray-300">
            Category:{" "}
          </label>
          <select
            {...register("category_id", {
              valueAsNumber: true,
              required: "Category is required",
            })}
            className="w-[14rem] border bg-white rounded-md px-3 py-2 focus:ring focus:ring-indigo-300 dark:bg-background dark:text-gray-300"
            onChange={(e) => getExpense(Number(e.target.value))} // Call getExpense with selected Expense_cat_name_id
            defaultValue="" // Set default value for the dropdown
          >
            <option disabled value="">
              Select Category
            </option>
            {ExpenseCategory.map((category) => (
              <option
                key={category.expense_cat_name_id} // Use unique key
                value={category.expense_cat_name_id} // Set value to expense_cat_name_id
              >
                {category.expense_cat_name} {/* Display category name */}
              </option>
            ))}
          </select>
          <p className="text-red-500 text-xs">
            {typeof errors.category_id?.message === "string" &&
              errors.category_id?.message}
          </p>
        </div>
      </form>

      {/* Table to display Expense data */}
      <div className="mt-4 bg-white dark:bg-background rounded-md">
        {ExpenseData.length > 0 ? (
          <Table>
            <TableHeader className="bg-primary dark:bg-secondary hover:bg-none">
              <TableRow>
                <TableHead className="text-gray-100">ID</TableHead>
                <TableHead className="text-gray-100">Date</TableHead>
                <TableHead className="text-gray-100">Category</TableHead>
                <TableHead className="text-gray-100">To Whom</TableHead>
                <TableHead className="text-gray-100">Description</TableHead>
                <TableHead className="text-gray-100">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ExpenseData.map((item) => (
                <TableRow className="h-[1rem]" key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.to_whom}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No Expense data available.</p>
        )}
      </div>
    </div>
  );
};

export default ViewExpense;
