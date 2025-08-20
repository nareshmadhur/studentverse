
"use client";

import EditPaymentForm from "@/components/payments/edit-payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { doc, getDoc, getDocs, collection, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Payment, Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditPaymentPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;
    const [payment, setPayment] = useState<Payment | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchPaymentAndStudents = async () => {
            const paymentDocRef = doc(db, "payments", id);
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
            setLoading(false);
        };
        fetchPaymentAndStudents();
    }, [id]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Edit Payment
                </h1>
            </div>
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
        </div>
    );
}
