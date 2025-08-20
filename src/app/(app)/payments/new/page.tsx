
"use client";

import AddPaymentForm from "@/components/payments/add-payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewPaymentPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
          setLoading(false);
        }
        fetchStudents();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Add New Payment
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Enter the details for the new payment.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-20 w-full" />
                        </div>
                    ) : (
                        <AddPaymentForm students={students} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
