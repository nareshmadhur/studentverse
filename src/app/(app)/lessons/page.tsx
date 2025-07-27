"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import LessonsTable from "@/components/lessons/lessons-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import AddLessonForm from "@/components/lessons/add-lesson-form";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Lesson } from "@/lib/definitions";

export default function LessonsPage() {
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "lessons"), (snapshot) => {
      const lessonData: Lesson[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        lessonData.push({
          lesson_id: doc.id,
          lesson_name: data.lesson_name,
          lesson_type: data.lesson_type,
          description: data.description,
          created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString(),
        });
      });
      setLessons(lessonData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Lessons
          </h1>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Lesson
            </Button>
          </DialogTrigger>
        </div>
        <LessonsTable lessons={lessons} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new lesson</DialogTitle>
        </DialogHeader>
        <AddLessonForm setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
