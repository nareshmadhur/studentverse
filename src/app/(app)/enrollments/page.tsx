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
import { Enrollment, Student, Lesson } from "@/lib/definitions";
import EnrollmentsTable from "@/components/enrollments/enrollments-table";
import AddEnrollmentForm from "@/components/enrollments/add-enrollment-form";

export default function EnrollmentsPage() {
  const [open, setOpen] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "enrollments"), (snapshot) => {
      const enrollmentData: Enrollment[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        enrollmentData.push({
          enrollment_id: doc.id,
          student_id: data.student_id,
          lesson_id: data.lesson_id,
          enrollment_date: data.enrollment_date,
          status: data.status,
          created_at: data.created_at?.toDate().toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate().toISOString() || new Date().toISOString(),
        });
      });
      setEnrollments(enrollmentData);
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
            Enrollments
          </h1>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Enrollment
            </Button>
          </DialogTrigger>
        </div>
        <EnrollmentsTable enrollments={enrollments} students={students} lessons={lessons} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new enrollment</DialogTitle>
        </DialogHeader>
        <AddEnrollmentForm setOpen={setOpen} students={students} lessons={lessons} />
      </DialogContent>
    </Dialog>
  );
}
