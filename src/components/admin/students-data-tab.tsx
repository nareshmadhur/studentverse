
"use client";

import { useState, useMemo, useContext } from "react";
import { Student } from "@/lib/definitions";
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
import { AppContext } from "@/app/(app)/layout";

export default function StudentsDataTab({ students }: { students: Student[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const { toast } = useToast();
    const { environment } = useContext(AppContext);

    const filteredStudents = useMemo(() => {
        return students.filter(student => 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [students, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedStudentIds(checked ? filteredStudents.map(s => s.id) : []);
    }

    const handleSelectStudent = (id: string, checked: boolean) => {
        setSelectedStudentIds(prev => 
            checked ? [...prev, id] : prev.filter(studentId => studentId !== id)
        );
    }

    const handleDeleteSelected = async () => {
        if (selectedStudentIds.length === 0) return;
        const batch = writeBatch(db);
        selectedStudentIds.forEach(id => {
            const docRef = doc(db, getCollectionName("students", environment), id);
            batch.delete(docRef);
        });
        try {
            await batch.commit();
            toast({ title: "Success", description: `${selectedStudentIds.length} student(s) permanently deleted.` });
            setSelectedStudentIds([]);
        } catch (error) {
            toast({ title: "Error", description: "Could not delete students.", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <Input 
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                {selectedStudentIds.length > 0 && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({selectedStudentIds.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the selected {selectedStudentIds.length} student(s). This action cannot be undone.
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
                                    checked={selectedStudentIds.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Date Added</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.map(student => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <Checkbox
                                        onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                                        checked={selectedStudentIds.includes(student.id)}
                                        aria-label={`Select student ${student.name}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{format(new Date(student.createdAt), "PPP")}</TableCell>
                                <TableCell>
                                    {student.deleted ? (
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
