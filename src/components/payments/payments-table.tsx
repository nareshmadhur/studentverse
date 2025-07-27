"use client";

import { useState } from "react";
import type { Payment, Fee, Student, Lesson } from "@/lib/definitions";
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
import EditPaymentForm from "./edit-payment-form";
import { format } from "date-fns";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function PaymentsTable({ 
  payments,
  fees, 
  students,
  lessons,
}: { 
  payments: Payment[],
  fees: Fee[], 
  students: Student[],
  lessons: Lesson[],
}) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleEditClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = async (paymentId: string) => {
    try {
      const paymentDocRef = doc(db, "payments", paymentId);
      await updateDoc(paymentDocRef, {
        deleted: true,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Payment Deleted",
        description: "The payment has been marked as deleted.",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        title: "Error",
        description: "There was an error deleting the payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFeeInfo = (feeId: string) => {
    const fee = fees.find(f => f.id === feeId);
    if (!fee) return { studentName: "Unknown", lessonName: "Unknown" };
    const student = students.find(s => s.id === fee.studentId);
    const lesson = lessons.find(l => l.id === fee.lessonId);
    return {
      studentName: student?.name || "Default",
      lessonName: lesson?.title || "Unknown Lesson",
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            A list of all recorded payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const { studentName, lessonName } = getFeeInfo(payment.feeId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{studentName}</TableCell>
                    <TableCell>{lessonName}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(payment.paymentDate), "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{payment.paymentMethod.replace(/_/g, ' ')}</Badge>
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
                          <DropdownMenuItem onClick={() => handleEditClick(payment)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleDeleteClick(payment.id)}>
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
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <EditPaymentForm
              setOpen={setIsEditDialogOpen}
              payment={selectedPayment}
              fees={fees}
              students={students}
              lessons={lessons}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
