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
};

export type Enrollment = {
  id: string;
  studentId: string;
  lessonId: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
};
