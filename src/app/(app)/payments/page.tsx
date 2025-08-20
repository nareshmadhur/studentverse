
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Payment, Student } from "@/lib/definitions";
import PaymentsTable from "@/components/payments/payments-table";
import Link from "next/link";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const q = query(collection(db, "payments"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentData: Payment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        paymentData.push({
          id: doc.id,
          studentId: data.studentId,
          amount: data.amount,
          currencyCode: data.currencyCode,
          transactionDate: (data.transactionDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        });
      });
      setPayments(paymentData);
    });

    const fetchStudents = async () => {
      const studentQuery = query(collection(db, "students"), where("deleted", "==", false));
      const studentSnapshot = await getDocs(studentQuery);
      const studentData: Student[] = studentSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Student
      });
      setStudents(studentData);
    }
    
    fetchStudents();

    return () => {
      unsubscribe();
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Payments
        </h1>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/payments/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Payment
          </Link>
        </Button>
      </div>
      <PaymentsTable 
        payments={payments} 
        students={students}
      />
    </div>
  );
}
