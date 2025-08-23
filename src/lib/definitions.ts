
export type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currencyCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type FeeOverride = {
  studentId: string;
  feeType: 'hourly' | 'subscription';
  amount: number;
  currencyCode: string;
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
  discipline: string; // Note: an empty string signifies a default/any discipline fee
  sessionType: '1-1' | 'group';
  feeType: 'hourly' | 'subscription';
  amount: number;
  currencyCode: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
};

export type Payment = {
  id: string;
  studentId: string;
  amount: number;
  currencyCode: string;
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
