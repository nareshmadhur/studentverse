
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
  const fees: Fee[] = feesSnapshot.docs.map(doc => {
       const data = doc.data();
      return {
        id: doc.id,
        ...data,
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
      // Find the applicable fee for this class
      const applicableFees = fees.filter(fee => {
        const isHourly = fee.feeType === 'hourly';
        const sessionMatch = fee.sessionType === classItem.sessionType;
        const disciplineMatch = !fee.discipline || fee.discipline === classItem.discipline;
        const dateMatch = new Date(fee.effectiveDate) <= new Date(classItem.scheduledDate);
        return isHourly && sessionMatch && disciplineMatch && dateMatch;
      });

      let bestFee: Fee | null = null;
      if (applicableFees.length > 0) {
        // Sort to find the best match: specific discipline first, then most recent effective date
        applicableFees.sort((a, b) => {
          if (a.discipline && !b.discipline) return -1;
          if (!a.discipline && b.discipline) return 1;
          return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
        });
        bestFee = applicableFees[0];
      }

      return {
        class: classItem,
        fee: bestFee,
        charge: bestFee?.amount || 0, // Default to 0 if no fee is found
      };
    })
    // Sort items by class date
    .sort((a, b) => new Date(a.class.scheduledDate).getTime() - new Date(b.class.scheduledDate).getTime());

  return {
    student,
    dateRange,
    items: statementItems,
    payments,
  };
}
