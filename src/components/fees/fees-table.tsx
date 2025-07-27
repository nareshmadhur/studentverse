"use client";

import { useState } from "react";
import type { Fee, Student, Lesson } from "@/lib/definitions";
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
import EditFeeForm from "./edit-fee-form";
import { format } from "date-fns";

export default function FeesTable({ 
  fees, 
  students, 
  lessons 
}: { 
  fees: Fee[], 
  students: Student[], 
  lessons: Lesson[] 
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  const handleEditClick = (fee: Fee) => {
    setSelectedFee(fee);
    setIsEditDialogOpen(true);
  };

  const getStudentName = (studentId?: string) => {
    if (!studentId) return "All Students";
    return students.find(student => student.student_id === studentId)?.name || "Unknown Student";
  }

  const getLessonName = (lessonId: string) => {
    return lessons.find(lesson => lesson.lesson_id === lessonId)?.lesson_name || "Unknown Lesson";
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Fees</CardTitle>
          <CardDescription>
            A list of all fees in your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.fee_id}>
                  <TableCell className="font-medium">
                    {getLessonName(fee.lesson_id)}
                  </TableCell>
                  <TableCell>{getStudentName(fee.student_id)}</TableCell>
                  <TableCell>
                    <Badge variant={fee.fee_type === 'hourly' ? 'secondary' : 'default'}>
                      {fee.fee_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: fee.currency_code }).format(fee.amount)}</TableCell>
                  <TableCell>{format(new Date(fee.effective_date), "PPP")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(fee)}>
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
            <DialogTitle>Edit Fee</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <EditFeeForm
              setOpen={setIsEditDialogOpen}
              fee={selectedFee}
              students={students}
              lessons={lessons}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
