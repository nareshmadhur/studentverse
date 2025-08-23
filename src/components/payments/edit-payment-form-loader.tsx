
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, getDocs, collection, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Payment, Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import EditPaymentForm from "@/components/payments/edit-payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditPaymentFormLoader({ paymentId }: { paymentId: string }) {
    const [payment, setPayment] = useState<Payment | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!paymentId) return;

        const fetchPaymentAndStudents = async () => {
            setLoading(true);
            try {
                const paymentDocRef = doc(db, "payments", paymentId);
                const paymentDocSnap = await getDoc(paymentDocRef);
                
                if (paymentDocSnap.exists()) {
                    const data = paymentDocSnap.data();
                    setPayment({ 
                        id: paymentDocSnap.id, 
                        ...data,
                        transactionDate: (data.transactionDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    } as Payment);
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

        fetchPaymentAndStudents();
    }, [paymentId]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Update the payment's information.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                     </div>
                ) : payment && students.length > 0 ? (
                    <EditPaymentForm payment={payment} students={students} />
                ) : (
                    <p>Payment not found.</p>
                )}
            </CardContent>
        </Card>
    );
}
