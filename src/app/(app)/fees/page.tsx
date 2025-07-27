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
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Fee, Student, Lesson } from "@/lib/definitions";
import FeesTable from "@/components/fees/fees-table";
import AddFeeForm from "@/components/fees/add-fee-form";

export default function FeesPage() {
  const [open, setOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "fees"), (snapshot) => {
      const feeData: Fee[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        feeData.push({
          fee_id: doc.id,
          lesson_id: data.lesson_id,
          student_id: data.student_id,
          fee_type: data.fee_type,
          amount: data.amount,
          currency_code: data.currency_code,
          effective_date: data.effective_date,
          created_at: data.created_at?.toDate().toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      setFees(feeData);
    });

    const fetchStudentsAndLessons = async () => {
      const [studentSnapshot, lessonSnapshot] = await Promise.all([
        getDocs(collection(db, "students")),
        getDocs(collection(db, "lessons"))
      ]);
      
      const studentData: Student[] = studentSnapshot.docs.map(doc => ({
        student_id: doc.id,
        ...doc.data()
      } as Student));
      setStudents(studentData);

      const lessonData: Lesson[] = lessonSnapshot.docs.map(doc => ({
        lesson_id: doc.id,
        ...doc.data()
      } as Lesson));
      setLessons(lessonData);
    }

    fetchStudentsAndLessons();

    return () => unsubscribe();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Fees
          </h1>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Fee
            </Button>
          </DialogTrigger>
        </div>
        <FeesTable fees={fees} students={students} lessons={lessons} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new fee</DialogTitle>
        </DialogHeader>
        <AddFeeForm setOpen={setOpen} students={students} lessons={lessons} />
      </DialogContent>
    </Dialog>
  );
}
