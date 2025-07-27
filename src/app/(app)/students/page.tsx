"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import StudentsTable from "@/components/students/students-table";
import { dummyStudents } from "@/lib/data";
import AddStudentForm from "@/components/students/add-student-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function StudentsPage() {
  const [open, setOpen] = useState(false);

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
        <StudentsTable students={dummyStudents} />
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
