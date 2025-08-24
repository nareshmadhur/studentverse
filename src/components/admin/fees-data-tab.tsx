
"use client";

import { useState, useMemo } from "react";
import { Fee, Student } from "@/lib/definitions";
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

export default function FeesDataTab({ fees, students }: { fees: Fee[], students: Student[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
    const { toast } = useToast();

    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown';

    const enrichedFees = useMemo(() => {
        return fees.map(f => ({
            ...f,
            studentName: getStudentName(f.studentId),
        }));
    }, [fees, students]);


    const filteredFees = useMemo(() => {
        return enrichedFees.filter(f => 
            f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.discipline || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
    }, [enrichedFees, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedFeeIds(checked ? filteredFees.map(f => f.id) : []);
    }

    const handleSelectFee = (id: string, checked: boolean) => {
        setSelectedFeeIds(prev => 
            checked ? [...prev, id] : prev.filter(feeId => feeId !== id)
        );
    }

    const handleDeleteSelected = async () => {
        if (selectedFeeIds.length === 0) return;
        const batch = writeBatch(db);
        selectedFeeIds.forEach(id => {
            const docRef = doc(db, getCollectionName("fees"), id);
            batch.delete(docRef);
        });
        try {
            await batch.commit();
            toast({ title: "Success", description: `${selectedFeeIds.length} fee(s) permanently deleted.` });
            setSelectedFeeIds([]);
        } catch (error) {
            toast({ title: "Error", description: "Could not delete fees.", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <Input 
                    placeholder="Search by student or discipline..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                {selectedFeeIds.length > 0 && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({selectedFeeIds.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the selected {selectedFeeIds.length} fee(s). This action cannot be undone.
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
                                    checked={selectedFeeIds.length > 0 && selectedFeeIds.length === filteredFees.length}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Discipline</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Effective Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredFees.map(f => (
                            <TableRow key={f.id}>
                                <TableCell>
                                    <Checkbox
                                        onCheckedChange={(checked) => handleSelectFee(f.id, !!checked)}
                                        checked={selectedFeeIds.includes(f.id)}
                                        aria-label={`Select fee for ${f.studentName}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{f.studentName}</TableCell>
                                <TableCell>{f.discipline || 'Any (Default)'}</TableCell>
                                <TableCell>{getCurrencySymbol(f.currencyCode)}{f.amount.toFixed(2)}</TableCell>
                                <TableCell>{format(new Date(f.effectiveDate), "PPP")}</TableCell>
                                <TableCell>
                                    {f.deleted ? (
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
