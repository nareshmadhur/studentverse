
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import EditStudentForm from "./edit-student-form";
import { currencies } from "@/lib/data/form-data";
import { getCurrencySymbol } from "@/lib/utils";

export default function StudentProfile({ id }: { id: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    const docRef = doc(db, "students", id);
    const unsubscribeStudent = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudent({ 
            id: docSnap.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Student);
      } else {
        console.log("No such document!");
        setStudent(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching student:", error);
        setLoading(false);
    });

    return () => {
      unsubscribeStudent();
    }
  }, [id]);

  const handleAddToNewClass = () => {
    router.push(`/classes?openDialog=true&studentId=${id}`);
  };

  const getCurrencyInfo = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? `${currency.name} (${getCurrencySymbol(currencyCode)})` : 'N/A';
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Student Profile
          </h1>
          <div className="w-24"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                {loading ? <Skeleton className="h-8 w-48 mb-2" /> : <CardTitle>{student?.name}</CardTitle>}
                {loading ? <Skeleton className="h-4 w-64" /> : <CardDescription>{student?.email}</CardDescription>}
              </div>
              <div className="flex gap-2">
                 <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit Student</span>
                    </Button>
                  </DialogTrigger>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToNewClass}>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  New Class
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ) : student ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold text-muted-foreground">Phone</p>
                  <p className="text-lg">{student?.phone || 'N/A'}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold text-muted-foreground">Country</p>
                  <p className="text-lg">{student?.country}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold text-muted-foreground">Preferred Currency</p>
                  <p className="text-lg">{student ? getCurrencyInfo(student.currencyCode) : 'N/A'}</p>
                </div>
              </div>
            ) : (
                <p>Student data not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        {student && (
           <EditStudentForm
              setOpen={setIsEditDialogOpen}
              student={student}
            />
        )}
      </DialogContent>
    </Dialog>
  );
}
