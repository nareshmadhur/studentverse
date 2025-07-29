"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect, Suspense } from "react";
import { collection, onSnapshot, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Fee, Student } from "@/lib/definitions";
import FeesTable from "@/components/fees/fees-table";
import AddFeeForm from "@/components/fees/add-fee-form";
import { useSearchParams } from "next/navigation";

function FeesPageContent() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const preselectedStudentId = searchParams.get('studentId');

  useEffect(() => {
    if (searchParams.get('openDialog') === 'true') {
      setOpen(true);
    }
  }, [searchParams]);
  
  useEffect(() => {
    const q = query(collection(db, "fees"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feeData: Fee[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        feeData.push({
          id: doc.id,
          studentId: data.studentId,
          discipline: data.discipline,
          sessionType: data.sessionType,
          feeType: data.feeType,
          amount: data.amount,
          currencyCode: data.currencyCode,
          effectiveDate: (data.effectiveDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        });
      });
      setFees(feeData);
    });

    const fetchStudents = async () => {
      const studentQuery = query(collection(db, "students"), where("deleted", "==", false));
      const studentSnapshot = await getDocs(studentQuery);
      const studentData: Student[] = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setStudents(studentData);
    }

    fetchStudents();

    return () => unsubscribe();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Fee Structure
          </h1>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Fee
            </Button>
          </DialogTrigger>
        </div>
        <FeesTable fees={fees} students={students} />
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new fee</DialogTitle>
        </DialogHeader>
        <AddFeeForm 
          setOpen={setOpen} 
          students={students} 
          preselectedStudentId={preselectedStudentId}
        />
      </DialogContent>
    </Dialog>
  );
}


export default function FeesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FeesPageContent />
    </Suspense>
  )
}
