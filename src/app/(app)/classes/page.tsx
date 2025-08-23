
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, List } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Class, Student } from "@/lib/definitions";
import ClassesTable from "@/components/classes/classes-table";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ClassCalendar } from "@/components/classes/class-calendar";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

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

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Classes
        </h1>
        <div className="flex items-center gap-2">
           <Button 
                variant={viewMode === 'calendar' ? 'secondary' : 'outline'} 
                size="icon" 
                onClick={() => setViewMode('calendar')}
                aria-label="Calendar View"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button 
                variant={viewMode === 'list' ? 'secondary' : 'outline'} 
                size="icon" 
                onClick={() => setViewMode('list')}
                aria-label="List View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/classes/new">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Class
              </Link>
            </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
            {viewMode === 'list' ? (
                <ClassesTable classes={classes} students={students} />
            ) : (
                <ClassCalendar classes={classes} students={students} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
