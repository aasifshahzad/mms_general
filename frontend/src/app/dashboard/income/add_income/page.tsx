"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/dashboard/Header";
import { toast } from "sonner";
import { IncomeAPI as API } from "@/api/Income/IncomeAPI";
import { Select } from "@/components/Select";
import { IncomeCategory } from "@/models/income/income";

interface AddIncomeModel {
  recipt_number: number;
  date: string;
  category_id: number;
  source: string;
  description: string;
  contact: string;
  amount: number;
}

// Likely structure of SelectOption
interface SelectOption {
    [key: string]: any;  // This is the index signature that's missing in IncomeCategory
    // Other properties like:
    value: string | number;
    label: string;
}

const AddIncome = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddIncomeModel>();

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory[]>([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    setIsLoading(true);
    try {
      const res = await API.GetIncomeCategory();
      console.log("Categories:", res);
      setIncomeCategory(res);
    } catch (error) {
      console.error("Error fetching income categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AddIncomeModel) => {
    try {
      setIsLoading(true);
    //   const response = await IncomeAPI.Create(data);
      toast.success("Income record added successfully");
      reset();
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Failed to add income record");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-auto px-4">
      <Header value="Add Income Record" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-background rounded-xl shadow-sm border border-gray-200 dark:border-secondary p-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-bold text-sm dark:text-gray-300">
                Receipt Number
              </label>
              <Input
                type="number"
                {...register("recipt_number", { valueAsNumber: true, required: "Receipt number is required" })}
                placeholder="Enter receipt number"
              />
              <p className="text-red-500 text-xs">{errors.recipt_number?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm dark:text-gray-300">
                Date
              </label>
              <Input
                type="date"
                {...register("date", { required: "Date is required" })}
              />
              <p className="text-red-500 text-xs">{errors.date?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm dark:text-gray-300">
                Category
              </label>
              <Select
                options={categories}
                {...register("category_id", {
                  valueAsNumber: true,
                  required: "Category is required",
                })}
                DisplayItem="title"
              />
              <p className="text-red-500 text-xs">{errors.category_id?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm dark:text-gray-300">
                Source
              </label>
              <Input
                {...register("source", { required: "Source is required" })}
                placeholder="e.g. Donation, Sponsorship"
              />
              <p className="text-red-500 text-xs">{errors.source?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm dark:text-gray-300">
                Description
              </label>
              <Input
                {...register("description", { required: "Description is required" })}
                placeholder="Enter description"
              />
              <p className="text-red-500 text-xs">{errors.description?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm dark:text-gray-300">
                Contact
              </label>
              <Input
                {...register("contact", { required: "Contact is required" })}
                placeholder="Enter contact"
              />
              <p className="text-red-500 text-xs">{errors.contact?.message}</p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm dark:text-gray-300">
                Amount
              </label>
              <Input
                type="number"
                {...register("amount", {
                  valueAsNumber: true,
                  required: "Amount is required",
                  min: { value: 1, message: "Amount must be at least 1" },
                })}
                placeholder="Enter amount"
              />
              <p className="text-red-500 text-xs">{errors.amount?.message}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                "Add Income"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddIncome;
