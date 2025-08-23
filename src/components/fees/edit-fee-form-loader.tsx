
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, getDocs, collection, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Fee, Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import EditFeeForm from "@/components/fees/edit-fee-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditFeeFormLoader({ feeId }: { feeId: string }) {
    const [fee, setFee] = useState<Fee | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!feeId) return;

        const fetchFeeAndStudents = async () => {
            setLoading(true);
            try {
                const feeDocRef = doc(db, "fees", feeId);
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
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeeAndStudents();
    }, [feeId]);

    return (
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
    );
}
