
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import EditStudentForm from "@/components/students/edit-student-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditStudentFormLoader({ studentId }: { studentId: string }) {
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) return;

        const fetchStudent = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, "students", studentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setStudent({ 
                        id: docSnap.id, 
                        ...data,
                        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                        updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    } as Student);
                }
            } catch (error) {
                console.error("Failed to fetch student:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [studentId]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Details</CardTitle>
                <CardDescription>Update the student's information.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                     </div>
                ) : student ? (
                    <EditStudentForm student={student} />
                ) : (
                    <p>Student not found.</p>
                )}
            </CardContent>
        </Card>
    );
}
