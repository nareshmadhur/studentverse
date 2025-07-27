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
import { Class, Lesson } from "@/lib/definitions";
import ClassesTable from "@/components/classes/classes-table";
import AddClassForm from "@/components/classes/add-class-form";

export default function ClassesPage() {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const q = query(collection(db, "classes"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const classData: Class[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        classData.push({
          id: doc.id,
          lessonId: data.lessonId,
          classDateTime: (data.classDateTime as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          duration: data.duration,
          status: data.status,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        });
      });
      setClasses(classData);
    });

    const fetchLessons = async () => {
      const lessonQuery = query(collection(db, "lessons"), where("deleted", "==", false));
      const lessonSnapshot = await getDocs(lessonQuery);
      const lessonData: Lesson[] = lessonSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lesson));
      setLessons(lessonData);
    }

    fetchLessons();

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
        <ClassesTable classes={classes} lessons={lessons} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new class</DialogTitle>
        </DialogHeader>
        <AddClassForm setOpen={setOpen} lessons={lessons} />
      </DialogContent>
    </Dialog>
  );
}
