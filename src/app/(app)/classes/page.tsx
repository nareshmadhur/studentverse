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
import { Class, Student } from "@/lib/definitions";
import ClassesTable from "@/components/classes/classes-table";
import AddClassForm from "@/components/classes/add-class-form";

export default function ClassesPage() {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const q = query(collection(db, "classes"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const classData: Class[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        classData.push({
          id: doc.id,
          discipline: data.discipline,
          category: data.category,
          sessionType: data.sessionType,
          title: data.title,
          description: data.description,
          scheduledDate: (data.scheduledDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          durationMinutes: data.durationMinutes,
          location: data.location,
          students: data.students || [],
          feeOverrides: data.feeOverrides || [],
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        });
      });
      setClasses(classData);
    });

    const fetchStudents = async () => {
      const studentQuery = query(collection(db, "students"), where("deleted", "==", false));
      const studentSnapshot = await getDocs(studentQuery);
      const studentData: Student[] = studentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));
      setStudents(studentData);
    }

    fetchStudents();

    return () => unsubscribe();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Classes
          </h1>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Class
            </Button>
          </DialogTrigger>
        </div>
        <ClassesTable classes={classes} students={students} />
      </div>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add a new class</DialogTitle>
        </DialogHeader>
        <AddClassForm setOpen={setOpen} allStudents={students} />
      </DialogContent>
    </Dialog>
  );
}
