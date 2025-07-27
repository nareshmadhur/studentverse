"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import LessonsTable from "@/components/lessons/lessons-table";
import { dummyLessons } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import AddLessonForm from "@/components/lessons/add-lesson-form";

export default function LessonsPage() {
  const [open, setOpen] = useState(false);

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
        <LessonsTable lessons={dummyLessons} />
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
