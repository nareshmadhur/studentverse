"use client";

import { useState } from "react";
import type { Payment, Fee, Student, Class } from "@/lib/definitions";
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
import { Pencil, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PaymentsTable({ 
  payments,
  fees, 
  students,
  classes,
}: { 
  payments: Payment[],
  fees: Fee[], 
  students: Student[],
  classes: Class[],
}) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleEditClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = async (paymentId: string) => {
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
    if (!fee) return { studentName: "Unknown", className: "Unknown" };
    const student = students.find(s => s.id === fee.studentId);
    const c = classes.find(l => l.id === fee.classId);
    return {
      studentName: student?.name || "Default",
      className: c?.title || "Unknown Class",
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
                <TableHead>Class</TableHead>
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
                const { studentName, className } = getFeeInfo(payment.feeId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{studentName}</TableCell>
                    <TableCell>{className}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(payment.paymentDate), "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{payment.paymentMethod.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                       <Button variant="outline" size="icon" onClick={() => handleEditClick(payment)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently mark the payment as deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(payment.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
              classes={classes}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
