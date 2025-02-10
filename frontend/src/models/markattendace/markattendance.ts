import { EntityBase } from "../EntityBase";

export interface MarkAttInput extends EntityBase {
    attendance_date: string;
    attendance_time_id: string;
    class_name_id: string;
    teacher_name_id: string;
    student_id?: number;
    attendance_value_id: string;
  }