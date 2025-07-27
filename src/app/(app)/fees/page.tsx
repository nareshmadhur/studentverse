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
import { Fee, Enrollment, Student, Lesson } from "@/lib/definitions";
import FeesTable from "@/components/fees/fees-table";
import AddFeeForm from "@/components/fees/add-fee-form";

export default function FeesPage() {
  const [open, setOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const q = query(collection(db, "fees"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feeData: Fee[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        feeData.push({
          id: doc.id,
          enrollmentId: data.enrollmentId,
          amount: data.amount,
          dueDate: (data.dueDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          status: data.status,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        });
      });
      setFees(feeData);
    });

    const fetchRelatedData = async () => {
      const enrollmentQuery = query(collection(db, "enrollments"), where("deleted", "==", false));
      const studentQuery = query(collection(db, "students"), where("deleted", "==", false));
      const lessonQuery = query(collection(db, "lessons"), where("deleted", "==", false));
      
      const [enrollmentSnapshot, studentSnapshot, lessonSnapshot] = await Promise.all([
        getDocs(enrollmentQuery),
        getDocs(studentQuery),
        getDocs(lessonQuery)
      ]);
      
      const enrollmentData: Enrollment[] = enrollmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));
      setEnrollments(enrollmentData);

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
            Fees
          </h1>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Fee
            </Button>
          </DialogTrigger>
        </div>
        <FeesTable fees={fees} enrollments={enrollments} students={students} lessons={lessons} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new fee</DialogTitle>
        </DialogHeader>
        <AddFeeForm setOpen={setOpen} enrollments={enrollments} students={students} lessons={lessons} />
      </DialogContent>
    </Dialog>
  );
}
