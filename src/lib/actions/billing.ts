
'use server';

import { collection, doc, getDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student, Class, Fee, Payment } from "@/lib/definitions";
import { DateRange } from "react-day-picker";

export interface StatementItem {
  class: Class;
  fee: Fee | null;
  charge: number;
}

export interface Statement {
  student: Student;
  dateRange: DateRange;
  items: StatementItem[];
  payments: Payment[];
}

export interface BillingSummary {
  totalAccrued: number;
  totalRealized: number;
  totalOutstanding: number;
  studentDetails: {
    studentId: string;
    studentName: string;
    currencyCode: string;
    billedOneOnOneAmount: number;
    billedOneOnOneCount: number;
    billedGroupAmount: number;
    billedGroupCount: number;
    totalBilled: number;
    totalPaid: number;
    balance: number;
    hasBillingIssues: boolean;
  }[];
}


const findBestFee = (classItem: Class, studentFees: Fee[]): Fee | null => {
    const classDate = new Date(classItem.scheduledDate);

    const applicableFees = studentFees.filter(fee => {
        const sessionMatch = fee.sessionType === classItem.sessionType;
        const disciplineMatch = fee.discipline === classItem.discipline || fee.discipline === '';
        const dateMatch = new Date(fee.effectiveDate) <= classDate;
        const feeTypeMatch = fee.feeType === 'hourly';
        return sessionMatch && disciplineMatch && dateMatch && feeTypeMatch;
    });

    if (applicableFees.length === 0) {
        return null;
    }

    // Sort to find the best match
    applicableFees.sort((a, b) => {
        // Rule 1: Specific discipline is better than generic ('')
        const aIsSpecific = a.discipline === classItem.discipline;
        const bIsSpecific = b.discipline === classItem.discipline;
        if (aIsSpecific && !bIsSpecific) return -1;
        if (!aIsSpecific && bIsSpecific) return 1;

        // Rule 2: Most recent effective date is better
        return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
    });

    return applicableFees[0];
};


export async function getBillingSummary(dateRange: DateRange): Promise<BillingSummary> {
  if (!dateRange.from || !dateRange.to) {
    throw new Error("Date range is required.");
  }

  const startDate = Timestamp.fromDate(dateRange.from);
  const endDate = Timestamp.fromDate(dateRange.to);

  // 1. Fetch all data concurrently
  const [studentsSnapshot, classesSnapshot, paymentsSnapshot, feesSnapshot] = await Promise.all([
    getDocs(query(collection(db, "students"), where("deleted", "==", false))),
    getDocs(query(collection(db, "classes"), where("scheduledDate", ">=", startDate), where("scheduledDate", "<=", endDate), where("deleted", "==", false))),
    getDocs(query(collection(db, "payments"), where("transactionDate", ">=", startDate), where("transactionDate", "<=", endDate), where("deleted", "==", false))),
    getDocs(query(collection(db, "fees"), where("deleted", "==", false))),
  ]);

  const students: Record<string, Student> = {};
  studentsSnapshot.forEach(doc => {
    const data = doc.data();
    students[doc.id] = { 
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Student
  });

  const classes: Class[] = classesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scheduledDate: (data.scheduledDate as Timestamp).toDate().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as Class
  });

  const payments: Payment[] = paymentsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      transactionDate: (data.transactionDate as Timestamp).toDate().toISOString(),
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Payment;
  });

  const allFees: Fee[] = feesSnapshot.docs.map(doc => {
       const data = doc.data();
      return {
        id: doc.id,
        ...data,
        discipline: data.discipline || '',
        effectiveDate: (data.effectiveDate as Timestamp).toDate().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as Fee
  });

  const studentDetails: Record<string, BillingSummary['studentDetails'][0]> = {};

  // Initialize student details ONLY for students who had classes in the period.
  classes.forEach(classItem => {
    classItem.students.forEach(studentId => {
      if (!studentDetails[studentId] && students[studentId]) {
        studentDetails[studentId] = {
          studentId,
          studentName: students[studentId].name,
          currencyCode: students[studentId].currencyCode,
          billedOneOnOneAmount: 0,
          billedOneOnOneCount: 0,
          billedGroupAmount: 0,
          billedGroupCount: 0,
          totalBilled: 0,
          totalPaid: 0,
          balance: 0,
          hasBillingIssues: false,
        };
      }
    });
  });

  // 2. Calculate charges for each class and aggregate by student
  classes.forEach(classItem => {
    classItem.students.forEach(studentId => {
      if (!studentDetails[studentId]) return;

      const studentFees = allFees.filter(f => f.studentId === studentId);
      const bestFee = findBestFee(classItem, studentFees);
      
      if (bestFee) {
        const amount = bestFee.amount || 0;
        if (classItem.sessionType === '1-1') {
            studentDetails[studentId].billedOneOnOneAmount += amount;
            studentDetails[studentId].billedOneOnOneCount++;
        } else {
            studentDetails[studentId].billedGroupAmount += amount;
            studentDetails[studentId].billedGroupCount++;
        }
      } else {
        studentDetails[studentId].hasBillingIssues = true;
      }
    });
  });

  // 3. Aggregate payments by student (only for students who are already in the details list)
  payments.forEach(payment => {
    if (studentDetails[payment.studentId]) {
      studentDetails[payment.studentId].totalPaid += payment.amount;
    }
  });

  // 4. Calculate balances and totals for the students in the list
  let totalAccrued = 0;
  
  Object.values(studentDetails).forEach(detail => {
    detail.totalBilled = detail.billedOneOnOneAmount + detail.billedGroupAmount;
    detail.balance = detail.totalBilled - detail.totalPaid;
    totalAccrued += detail.totalBilled;
  });
  
  // To get a true "Revenue Realized" for the entire period (including payments for past work),
  // we calculate it separately.
  const totalRealizedInPeriod = payments.reduce((acc, p) => acc + p.amount, 0);

  const totalOutstanding = totalAccrued - totalRealizedInPeriod;

  // 5. Sort student details by name
  const sortedStudentDetails = Object.values(studentDetails).sort((a, b) => a.studentName.localeCompare(b.studentName));


  return {
    totalAccrued,
    totalRealized: totalRealizedInPeriod,
    totalOutstanding,
    studentDetails: sortedStudentDetails,
  };
}

export async function getStatementData(studentId: string, dateRange: DateRange): Promise<Statement> {
  if (!dateRange.from || !dateRange.to) {
    throw new Error("Date range is required.");
  }

  // 1. Fetch student details
  const studentDoc = await getDoc(doc(db, "students", studentId));
  if (!studentDoc.exists()) {
    throw new Error("Student not found.");
  }
  const studentData = studentDoc.data();
  const student = { 
    id: studentDoc.id, 
    ...studentData,
    createdAt: (studentData.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    updatedAt: (studentData.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
  } as Student;

  // 2. Fetch all classes for the student within the date range
  const classesQuery = query(
    collection(db, "classes"),
    where("students", "array-contains", studentId),
    where("scheduledDate", ">=", Timestamp.fromDate(dateRange.from)),
    where("scheduledDate", "<=", Timestamp.fromDate(dateRange.to)),
    where("deleted", "==", false)
  );
  const classesSnapshot = await getDocs(classesQuery);
  const classes: Class[] = classesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        scheduledDate: (data.scheduledDate as Timestamp).toDate().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as Class
  });

  // 3. Fetch all fees for the student
  const feesQuery = query(
    collection(db, "fees"),
    where("studentId", "==", studentId),
    where("deleted", "==", false)
  );
  const feesSnapshot = await getDocs(feesQuery);
  const studentFees: Fee[] = feesSnapshot.docs.map(doc => {
       const data = doc.data();
      return {
        id: doc.id,
        ...data,
        discipline: data.discipline || '',
        effectiveDate: (data.effectiveDate as Timestamp).toDate().toISOString(),
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      } as Fee
  });
  
  // 4. Fetch all payments for the student within the date range
  const paymentsQuery = query(
    collection(db, "payments"),
    where("studentId", "==", studentId),
    where("transactionDate", ">=", Timestamp.fromDate(dateRange.from)),
    where("transactionDate", "<=", Timestamp.fromDate(dateRange.to)),
    where("deleted", "==", false)
  );
  const paymentsSnapshot = await getDocs(paymentsQuery);
  const payments: Payment[] = paymentsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      transactionDate: (data.transactionDate as Timestamp).toDate().toISOString(),
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Payment;
  });

  // 5. Calculate charge for each class
  const statementItems: StatementItem[] = classes
    .map(classItem => {
      const bestFee = findBestFee(classItem, studentFees);
      return {
        class: classItem,
        fee: bestFee,
        charge: bestFee?.amount || 0,
      };
    })
    .sort((a, b) => new Date(a.class.scheduledDate).getTime() - new Date(b.class.scheduledDate).getTime());

  return {
    student,
    dateRange,
    items: statementItems,
    payments,
  };
}
