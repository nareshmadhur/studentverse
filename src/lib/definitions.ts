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
