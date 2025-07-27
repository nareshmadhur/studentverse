"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Payment, Fee, Student, Lesson } from "@/lib/definitions";
import PaymentsTable from "@/components/payments/payments-table";
import AddPaymentForm from "@/components/payments/add-payment-form";

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const q = query(collection(db, "payments"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentData: Payment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        paymentData.push({
          id: doc.id,
          feeId: data.feeId,
          amount: data.amount,
          paymentDate: (data.paymentDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          paymentMethod: data.paymentMethod,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        });
      });
      setPayments(paymentData);
    });

    const fetchRelatedData = async () => {
      const feeQuery = query(collection(db, "fees"), where("deleted", "==", false));
      const studentQuery = query(collection(db, "students"), where("deleted", "==", false));
      const lessonQuery = query(collection(db, "lessons"), where("deleted", "==", false));

      const [feeSnapshot, studentSnapshot, lessonSnapshot] = await Promise.all([
        getDocs(feeQuery),
        getDocs(studentQuery),
        getDocs(lessonQuery)
      ]);
      
      const feeData: Fee[] = feeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fee));
      setFees(feeData);

      const studentData: Student[] = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentData);

      const lessonData: Lesson[] = lessonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
      setLessons(lessonData);
    }

    fetchRelatedData();

    return () => unsubscribe();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Payments
          </h1>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Payment
            </Button>
          </DialogTrigger>
        </div>
        <PaymentsTable 
          payments={payments} 
          fees={fees} 
          students={students} 
          lessons={lessons} 
        />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new payment</DialogTitle>
        </DialogHeader>
        <AddPaymentForm setOpen={setOpen} fees={fees} students={students} lessons={lessons} />
      </DialogContent>
    </Dialog>
  );
}
