
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, List, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, getDocs, query, where, Timestamp, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Class, Student } from "@/lib/definitions";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClassCalendar } from "@/components/classes/class-calendar";
import { format, isSameDay } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import EditClassFormLoader from "@/components/classes/edit-class-form-loader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "classes"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const classData: Class[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledDate: (data.scheduledDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Class;
      }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
      setClasses(classData);
    });

    const fetchStudents = async () => {
      const studentQuery = query(collection(db, "students"), where("deleted", "==", false));
      const studentSnapshot = await getDocs(studentQuery);
      const studentData: Student[] = studentSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Student
      });
      setStudents(studentData);
    }

    fetchStudents();

    return () => unsubscribe();
  }, []);

  const filteredClasses = useMemo(() => {
    if (!selectedDate) {
      // Show upcoming classes by default if no date is selected
      return classes.filter(c => new Date(c.scheduledDate) >= new Date()).reverse();
    }
    return classes.filter(c => isSameDay(new Date(c.scheduledDate), selectedDate));
  }, [classes, selectedDate]);
  
  const getStudentNames = (studentIds: string[]) => {
    return studentIds.map(id => students.find(s => s.id === id)?.name || 'Unknown').join(', ');
  }

  const handleEditClick = (classId: string) => {
    setSelectedClassId(classId);
    setView('edit');
  };
  
  const handleDelete = async (classId: string) => {
    try {
      await updateDoc(doc(db, "classes", classId), { deleted: true, updatedAt: serverTimestamp() });
      toast({ title: "Class Deleted", description: "The class has been marked as deleted." });
    } catch (error) {
       toast({ title: "Error", description: "Could not delete the class.", variant: "destructive" });
    }
  }

  const renderRightPanel = () => {
    if (view === 'edit' && selectedClassId) {
       return <EditClassFormLoader classId={selectedClassId} onFinished={() => setView('list')} />;
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? `Classes for ${format(selectedDate, 'PPP')}` : 'Upcoming Classes'}
          </CardTitle>
          <CardDescription>
            {selectedDate ? 'A list of classes for the selected day.' : 'All upcoming scheduled classes.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClasses.length > 0 ? (
            <div className="space-y-4">
              {filteredClasses.map(c => (
                <div key={c.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-lg">{c.title}</p>
                            <p className="text-sm text-muted-foreground">{c.discipline}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary">{format(new Date(c.scheduledDate), "p")}</Badge>
                           <Badge variant={c.sessionType === '1-1' ? 'secondary' : 'default'}>{c.sessionType}</Badge>
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(c.id)}><Pencil className="h-4 w-4" /></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the class.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(c.id)}>Continue</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                     <p className="text-sm mt-2">{getStudentNames(c.students)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p>No classes scheduled for this day.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Classes
        </h1>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/classes/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Class
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <Card>
            <ClassCalendar 
              classes={classes} 
              students={students}
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setView('list'); // Switch back to list view when a new date is selected
              }}
            />
          </Card>
        </div>
        <div className="lg:col-span-2">
            {renderRightPanel()}
        </div>
      </div>
    </div>
  );
}
