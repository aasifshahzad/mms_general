export interface AddFeeModel {
    student_id: number,
    class_id: number,
    fee_amount: number,
    fee_month: string,
    fee_year: number
}

export interface GetFeeModel {
    fee_status: number,
    student_id: number,
    class_id: number,
    fee_amount: number,
    fee_month: string,
    fee_year: number
}