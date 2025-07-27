"use client";

import { useState } from "react";
import type { Fee, Enrollment, Student, Lesson } from "@/lib/definitions";
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function FeesTable({ 
  fees, 
  enrollments,
  students,
  lessons,
}: { 
  fees: Fee[], 
  enrollments: Enrollment[],
  students: Student[],
  lessons: Lesson[],
}) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  const handleEditClick = (fee: Fee) => {
    setSelectedFee(fee);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = async (feeId: string) => {
    try {
      const feeDocRef = doc(db, "fees", feeId);
      await updateDoc(feeDocRef, {
        deleted: true,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Fee Deleted",
        description: "The fee has been marked as deleted.",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        title: "Error",
        description: "There was an error deleting the fee. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getEnrollmentInfo = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return { studentName: "Unknown", lessonName: "Unknown" };
    const student = students.find(s => s.id === enrollment.studentId);
    const lesson = lessons.find(l => l.id === enrollment.lessonId);
    return {
      studentName: student?.name || "Unknown Student",
      lessonName: lesson?.title || "Unknown Lesson"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Fees</CardTitle>
          <CardDescription>
            A list of all outstanding and paid fees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => {
                const { studentName, lessonName } = getEnrollmentInfo(fee.enrollmentId);
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{studentName}</TableCell>
                    <TableCell>{lessonName}</TableCell>
                    <TableCell>${fee.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(fee.dueDate), "PPP")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={fee.status === "paid" ? "default" : fee.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {fee.status}
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
                          <DropdownMenuItem onClick={() => handleEditClick(fee)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(fee.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
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
              enrollments={enrollments}
              students={students}
              lessons={lessons}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
