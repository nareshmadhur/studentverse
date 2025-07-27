"use client";

import { useState } from "react";
import type { Class, Lesson } from "@/lib/definitions";
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
import EditClassForm from "./edit-class-form";
import { format } from "date-fns";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function ClassesTable({ 
  classes, 
  lessons 
}: { 
  classes: Class[], 
  lessons: Lesson[] 
}) {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const handleEditClick = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = async (classId: string) => {
    try {
      const classDocRef = doc(db, "classes", classId);
      await updateDoc(classDocRef, {
        deleted: true,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Class Deleted",
        description: "The class has been marked as deleted.",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        title: "Error",
        description: "There was an error deleting the class. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLessonName = (lessonId: string) => {
    return lessons.find(lesson => lesson.id === lessonId)?.title || "Unknown Lesson";
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>
            A list of all scheduled classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration (mins)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell className="font-medium">
                    {getLessonName(classItem.lessonId)}
                  </TableCell>
                  <TableCell>{format(new Date(classItem.classDateTime), "PPP p")}</TableCell>
                  <TableCell>{classItem.duration}</TableCell>
                  <TableCell>
                    <Badge
                      variant={classItem.status === "scheduled" ? "default" : classItem.status === 'completed' ? 'secondary' : 'destructive'}
                    >
                      {classItem.status}
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
                        <DropdownMenuItem onClick={() => handleEditClick(classItem)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleDeleteClick(classItem.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <EditClassForm
              setOpen={setIsEditDialogOpen}
              classItem={selectedClass}
              lessons={lessons}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
