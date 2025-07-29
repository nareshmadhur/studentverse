
export type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currencyId: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type FeeOverride = {
  studentId: string;
  feeType: 'hourly' | 'subscription';
  amount: number;
  currencyId: string;
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
  currencyId: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Payment = {
  id: string;
  studentId: string;
  amount: number;
  currencyId: string;
  transactionDate: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Discipline = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export type Currency = {
  id: string;
  name: string;
  code: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}
