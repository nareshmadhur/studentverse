
"use client";

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, getCollectionName } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Discipline } from "@/lib/definitions";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { format } from "date-fns";

export default function DisciplinesTable({ disciplines }: { disciplines: Discipline[] }) {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      const docRef = doc(db, getCollectionName("disciplines"), id);
      await updateDoc(docRef, {
        deleted: true,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Discipline Deleted",
        description: "The discipline has been marked as deleted.",
      });
    } catch (error) {
      console.error("Error deleting discipline: ", error);
      toast({
        title: "Error Deleting Discipline",
        description: "There was an error deleting the discipline.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {disciplines.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No disciplines added yet.
                        </TableCell>
                    </TableRow>
                )}
                {disciplines.map((discipline) => (
                <TableRow key={discipline.id}>
                    <TableCell className="font-medium">{discipline.name}</TableCell>
                    <TableCell>{discipline.createdAt ? format(new Date(discipline.createdAt), "PPP") : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This will mark the discipline as deleted. It will no longer be available for selection.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(discipline.id)}>
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
    </div>
  );
}
