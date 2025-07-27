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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/lib/definitions";

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
      const studentData: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        studentData.push({
          student_id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          currency_code: data.currency_code,
          created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString(),
        });
      });
      setStudents(studentData);
    });
    return () => unsubscribe();
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
        <StudentsTable students={students} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new student</DialogTitle>
        </DialogHeader>
        <AddStudentForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
