"use client";

import { useState } from "react";
import type { Payment, Student } from "@/lib/definitions";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PaymentsTable({ 
  payments,
  students,
}: { 
  payments: Payment[],
  students: Student[],
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

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || "Unknown Student";
  };

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
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Amount (INR)</TableHead>
                  <TableHead>Transaction Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{getStudentName(payment.studentId)}</TableCell>
                    <TableCell>
                      {payment.amount.toFixed(2)}{' '}
                      <Badge variant="outline">{payment.currencyCode}</Badge>
                    </TableCell>
                    <TableCell>₹{payment.amountInInr.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(payment.transactionDate), "PPP")}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary">{payment.paymentMethod}</Badge>
                        </TooltipTrigger>
                        {payment.notes && <TooltipContent>{payment.notes}</TooltipContent>}
                      </Tooltip>
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
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
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
              students={students}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
