
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import StudentsTable from "@/components/students/students-table";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/lib/definitions";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);

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
          currencyCode: data.currencyCode,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        });
      });
      setStudents(studentData);
    });

    return () => {
      unsubscribe();
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Students
        </h1>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/students/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Student
          </Link>
        </Button>
      </div>
      <StudentsTable students={students} />
    </div>
  );
}
