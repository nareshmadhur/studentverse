"use client";

import { useState } from "react";
import type { Enrollment, Student, Lesson } from "@/lib/definitions";
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
import { Badge } from "@/components/ui/badge";
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
import EditEnrollmentForm from "./edit-enrollment-form";
import { format } from "date-fns";

export default function EnrollmentsTable({ 
  enrollments, 
  students, 
  lessons 
}: { 
  enrollments: Enrollment[], 
  students: Student[], 
  lessons: Lesson[] 
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const handleEditClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsEditDialogOpen(true);
  };

  const getStudentName = (studentId: string) => {
    return students.find(student => student.student_id === studentId)?.name || "Unknown Student";
  }

  const getLessonName = (lessonId: string) => {
    return lessons.find(lesson => lesson.lesson_id === lessonId)?.lesson_name || "Unknown Lesson";
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Enrollments</CardTitle>
          <CardDescription>
            A list of all student enrollments in your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.enrollment_id}>
                  <TableCell className="font-medium">
                    {getStudentName(enrollment.student_id)}
                  </TableCell>
                  <TableCell>{getLessonName(enrollment.lesson_id)}</TableCell>
                  <TableCell>{format(new Date(enrollment.enrollment_date), "PPP")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={enrollment.status === "active" ? "default" : "secondary"}
                    >
                      {enrollment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(enrollment)}>
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
            <DialogTitle>Edit Enrollment</DialogTitle>
          </DialogHeader>
          {selectedEnrollment && (
            <EditEnrollmentForm
              setOpen={setIsEditDialogOpen}
              enrollment={selectedEnrollment}
              students={students}
              lessons={lessons}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
