export type Student = {
  student_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  currency_code: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  lesson_id: string;
  lesson_type: '1-1' | 'group';
  lesson_name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Class = {
  class_id: string;
  lesson_id: string;
  date: string;
  duration_minutes: number;
  location?: string;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  enrollment_id: string;
  student_id: string;
  lesson_id: string;
  enrollment_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type ClassAttendance = {
  attendance_id: string;
  class_id: string;
  student_id: string;
  attended: boolean;
  notes?: string;
  created_at: string;
};

export type Fee = {
  fee_id: string;
  lesson_id: string;
  student_id?: string;
  fee_type: 'hourly' | 'subscription';
  amount: number;
  currency_code: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  effective_date: string;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  payment_id: string;
  student_id: string;
  amount: number;
  currency_code: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  exchange_rate: number;
  amount_in_inr: number;
  transaction_date: string;
  payment_method: 'Cash' | 'Card' | 'Online';
  notes?: string;
  created_at: string;
  updated_at: string;
};
