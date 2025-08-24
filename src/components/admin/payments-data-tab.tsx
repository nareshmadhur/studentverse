
"use client";

import { useState, useMemo, useContext } from "react";
import { Payment, Student } from "@/lib/definitions";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { doc, writeBatch } from "firebase/firestore";
import { db, getCollectionName } from "@/lib/firebase";
import { getCurrencySymbol } from "@/lib/utils";
import { AppContext } from "@/app/(app)/layout";

export default function PaymentsDataTab({ payments, students }: { payments: Payment[], students: Student[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
    const { toast } = useToast();
    const { environment } = useContext(AppContext);

    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown';

    const enrichedPayments = useMemo(() => {
        return payments.map(p => ({
            ...p,
            studentName: getStudentName(p.studentId),
        }));
    }, [payments, students]);


    const filteredPayments = useMemo(() => {
        return enrichedPayments.filter(p => 
            p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    }, [enrichedPayments, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedPaymentIds(checked ? filteredPayments.map(p => p.id) : []);
    }

    const handleSelectPayment = (id: string, checked: boolean) => {
        setSelectedPaymentIds(prev => 
            checked ? [...prev, id] : prev.filter(paymentId => paymentId !== id)
        );
    }

    const handleDeleteSelected = async () => {
        if (selectedPaymentIds.length === 0) return;
        const batch = writeBatch(db);
        selectedPaymentIds.forEach(id => {
            const docRef = doc(db, getCollectionName("payments", environment), id);
            batch.delete(docRef);
        });
        try {
            await batch.commit();
            toast({ title: "Success", description: `${selectedPaymentIds.length} payment(s) permanently deleted.` });
            setSelectedPaymentIds([]);
        } catch (error) {
            toast({ title: "Error", description: "Could not delete payments.", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <Input 
                    placeholder="Search by student, method, or notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                {selectedPaymentIds.length > 0 && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({selectedPaymentIds.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the selected {selectedPaymentIds.length} payment(s). This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteSelected}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox 
                                    onCheckedChange={handleSelectAll} 
                                    checked={selectedPaymentIds.length > 0 && selectedPaymentIds.length === filteredPayments.length}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPayments.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <Checkbox
                                        onCheckedChange={(checked) => handleSelectPayment(p.id, !!checked)}
                                        checked={selectedPaymentIds.includes(p.id)}
                                        aria-label={`Select payment for ${p.studentName}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{p.studentName}</TableCell>
                                <TableCell>{getCurrencySymbol(p.currencyCode)}{p.amount.toFixed(2)}</TableCell>
                                <TableCell>{format(new Date(p.transactionDate), "PPP")}</TableCell>
                                <TableCell>{p.paymentMethod}</TableCell>
                                <TableCell>
                                    {p.deleted ? (
                                        <Badge variant="destructive">Deleted</Badge>
                                    ) : (
                                        <Badge variant="secondary">Active</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
