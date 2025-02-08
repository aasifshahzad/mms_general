import { EntityBase } from "../EntityBase";

export interface MarkAttInput extends EntityBase {
    attendance_date: string;
    attendance_class: string;
    attendance_student: string;
    attendance_std_fname: string;
    attendance_teacher: string;
    attendance_value_id: string;
    attendance_time: string;
  }