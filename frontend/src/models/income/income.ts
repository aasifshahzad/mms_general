export interface AddIncomeModel {
    recipt_number: number;
    date: string; // ISO date string format
    category_id: number;
    source: string;
    description: string;
    contact: string;
    amount: number;
  }

// export interface GetFeeModel {
//     fee_status: number,
//     student_id: number,
//     class_id: number,
//     fee_amount: number,
//     fee_month: string,
//     fee_year: number
// }