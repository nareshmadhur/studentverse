
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import StudentsTable from "@/components/students/students-table";
import AddStudentForm from "@/components/students/add-student-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student, Currency } from "@/lib/definitions";

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    const q = query(collection(db, "students"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        studentData.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          currencyId: data.currencyId,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        });
      });
      setStudents(studentData);
    });

    const currenciesQuery = query(collection(db, "currencies"), where("deleted", "==", false));
    const unsubscribeCurrencies = onSnapshot(currenciesQuery, (snapshot) => {
        const currencyData: Currency[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Currency));
        setCurrencies(currencyData);
    });


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
            Students
          </h1>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Student
            </Button>
          </DialogTrigger>
        </div>
        <StudentsTable students={students} currencies={currencies} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new student</DialogTitle>
        </DialogHeader>
        <AddStudentForm setOpen={setOpen} currencies={currencies} />
      </DialogContent>
    </Dialog>
  );
}
