
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
import { Payment, Student, Currency } from "@/lib/definitions";
import PaymentsTable from "@/components/payments/payments-table";
import AddPaymentForm from "@/components/payments/add-payment-form";

export default function PaymentsPage() {
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

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
          currencyId: data.currencyId,
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
      const studentData: Student[] = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentData);
    }
    
    const currenciesQuery = query(collection(db, "currencies"), where("deleted", "==", false));
    const unsubscribeCurrencies = onSnapshot(currenciesQuery, (snapshot) => {
        const currencyData: Currency[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Currency));
        setCurrencies(currencyData);
    });

    fetchStudents();

    return () => {
      unsubscribe();
      unsubscribeCurrencies();
    }
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
          students={students}
          currencies={currencies}
        />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new payment</DialogTitle>
        </DialogHeader>
        <AddPaymentForm setOpen={setOpen} students={students} />
      </DialogContent>
    </Dialog>
  );
}
