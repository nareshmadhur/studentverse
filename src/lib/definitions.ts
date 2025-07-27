export type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currencyCode: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  country: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Lesson = {
  id: string;
  category: string;
  discipline: string;
  lessonType: '1-1' | 'group';
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Enrollment = {
  id: string;
  studentId: string;
  lessonId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Class = {
  id: string;
  lessonId: string;
  classDateTime: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Fee = {
  id: string;
  studentId: string | null;
  lessonId: string;
  feeType: 'hourly' | 'subscription';
  amount: number;
  currencyCode: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Payment = {
  id: string;
  feeId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'card' | 'cash' | 'bank_transfer';
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
