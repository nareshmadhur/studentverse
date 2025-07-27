"use client";

import { useState } from "react";
import type { Class, Lesson } from "@/lib/definitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditClassForm from "./edit-class-form";
import { format } from "date-fns";

export default function ClassesTable({ classes, lessons }: { classes: Class[], lessons: Lesson[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleEditClick = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditDialogOpen(true);
  };

  const getLessonName = (lessonId: string) => {
    return lessons.find(lesson => lesson.lesson_id === lessonId)?.lesson_name || "Unknown Lesson";
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>
            A list of all scheduled classes in your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration (mins)</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.class_id}>
                  <TableCell className="font-medium">
                    {getLessonName(classItem.lesson_id)}
                  </TableCell>
                  <TableCell>{format(new Date(classItem.date), "PPP p")}</TableCell>
                  <TableCell>{classItem.duration_minutes}</TableCell>
                  <TableCell>{classItem.location || "N/A"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(classItem)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <EditClassForm
              setOpen={setIsEditDialogOpen}
              classItem={selectedClass}
              lessons={lessons}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
