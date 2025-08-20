
"use client";

import EditFeeForm from "@/components/fees/edit-fee-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { doc, getDoc, getDocs, collection, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Fee, Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditFeePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [fee, setFee] = useState<Fee | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeeAndStudents = async () => {
            const feeDocRef = doc(db, "fees", params.id);
            const feeDocSnap = await getDoc(feeDocRef);
            
            if (feeDocSnap.exists()) {
                const data = feeDocSnap.data();
                setFee({ 
                    id: feeDocSnap.id, 
                    ...data,
                    effectiveDate: (data.effectiveDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                } as Fee);
            }

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
        };
        fetchFeeAndStudents();
    }, [params.id]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Edit Fee
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Fee Details</CardTitle>
                    <CardDescription>Update the fee's information.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                    ) : fee && students.length > 0 ? (
                        <EditFeeForm fee={fee} students={students} />
                    ) : (
                        <p>Fee not found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
