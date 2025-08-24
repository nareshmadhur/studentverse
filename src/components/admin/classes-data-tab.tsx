
"use client";

import { useState, useMemo, useContext } from "react";
import { Class, Student } from "@/lib/definitions";
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

export default function ClassesDataTab({ classes, students }: { classes: Class[], students: Student[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const { toast } = useToast();
    const { environment } = useContext(AppContext);

    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown';

    const enrichedClasses = useMemo(() => {
        return classes.map(c => ({
            ...c,
            studentNames: (c.students || []).map(getStudentName).join(', ')
        }));
    }, [classes, students]);


    const filteredClasses = useMemo(() => {
        return enrichedClasses.filter(c => 
            (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.discipline || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.studentNames || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a,b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    }, [enrichedClasses, searchTerm]);

    const handleSelectAll = (checked: boolean) => {
        setSelectedClassIds(checked ? filteredClasses.map(c => c.id) : []);
    }

    const handleSelectClass = (id: string, checked: boolean) => {
        setSelectedClassIds(prev => 
            checked ? [...prev, id] : prev.filter(classId => classId !== id)
        );
    }

    const handleDeleteSelected = async () => {
        if (selectedClassIds.length === 0) return;
        const batch = writeBatch(db);
        selectedClassIds.forEach(id => {
            const docRef = doc(db, getCollectionName("classes", environment), id);
            batch.delete(docRef);
        });
        try {
            await batch.commit();
            toast({ title: "Success", description: `${selectedClassIds.length} class(es) permanently deleted.` });
            setSelectedClassIds([]);
        } catch (error) {
            toast({ title: "Error", description: "Could not delete classes.", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <Input 
                    placeholder="Search by title, discipline, or student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                {selectedClassIds.length > 0 && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({selectedClassIds.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the selected {selectedClassIds.length} class(es). This action cannot be undone.
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
                                    checked={selectedClassIds.length > 0 && selectedClassIds.length === filteredClasses.length}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClasses.map(c => (
                            <TableRow key={c.id}>
                                <TableCell>
                                    <Checkbox
                                        onCheckedChange={(checked) => handleSelectClass(c.id, !!checked)}
                                        checked={selectedClassIds.includes(c.id)}
                                        aria-label={`Select class ${c.title}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {c.title}
                                    <p className="text-xs text-muted-foreground">{c.discipline}</p>
                                </TableCell>
                                <TableCell>{c.studentNames}</TableCell>
                                <TableCell>{c.scheduledDate ? format(new Date(c.scheduledDate), "PPP p") : 'N/A'}</TableCell>
                                <TableCell>
                                    {c.deleted ? (
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
