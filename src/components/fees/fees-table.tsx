"use client";

import { useState } from "react";
import type { Fee, Student, Class } from "@/lib/definitions";
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
import EditFeeForm from "./edit-fee-form";
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

export default function FeesTable({ 
  fees, 
  students,
  classes,
}: { 
  fees: Fee[], 
  students: Student[],
  classes: Class[],
}) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  const handleEditClick = (fee: Fee) => {
    setSelectedFee(fee);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (feeId: string) => {
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
  
  const getStudentName = (studentId: string | null) => {
    if (!studentId) return <Badge variant="secondary">Default</Badge>;
    return students.find(s => s.id === studentId)?.name || "Unknown Student";
  }
  
  const getClassName = (classId: string) => {
    return classes.find(l => l.id === classId)?.title || "Unknown Class";
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Fees</CardTitle>
          <CardDescription>
            A list of all default and student-specific fees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{getClassName(fee.classId)}</TableCell>
                  <TableCell>{getStudentName(fee.studentId)}</TableCell>
                  <TableCell>{fee.amount.toFixed(2)} <Badge variant="outline">{fee.currencyCode}</Badge></TableCell>
                   <TableCell>
                    <Badge variant={fee.feeType === 'hourly' ? 'default' : 'secondary'}>
                      {fee.feeType}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(fee.effectiveDate), "PPP")}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditClick(fee)}>
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
                            This action cannot be undone. This will permanently mark the fee as deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(fee.id)}>
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
              classes={classes}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
