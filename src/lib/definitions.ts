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

export type FeeOverride = {
  studentId: string;
  feeType: 'hourly' | 'subscription';
  amount: number;
  currencyCode: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  effectiveDate: string;
}

export type Class = {
  id: string;
  discipline: string;
  category?: string;
  sessionType: '1-1' | 'group';
  title: string;
  description?: string;
  scheduledDate: string;
  durationMinutes: number;
  location?: string;
  students: string[];
  feeOverrides?: FeeOverride[];
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Fee = {
  id: string;
  studentId: string;
  discipline?: string;
  sessionType: '1-1' | 'group';
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
  studentId: string;
  amount: number;
  currencyCode: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AUD';
  transactionDate: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};
