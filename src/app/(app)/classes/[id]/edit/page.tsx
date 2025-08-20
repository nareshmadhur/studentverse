
"use client";

import EditClassForm from "@/components/classes/edit-class-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { doc, getDoc, getDocs, collection, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Class, Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";


export default function EditClassPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [classItem, setClassItem] = useState<Class | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassAndStudents = async () => {
            const classDocRef = doc(db, "classes", params.id);
            const classDocSnap = await getDoc(classDocRef);
            
            if (classDocSnap.exists()) {
                const data = classDocSnap.data();
                setClassItem({ 
                    id: classDocSnap.id, 
                    ...data,
                    scheduledDate: (data.scheduledDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                } as Class);
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
            setAllStudents(studentData);
            setLoading(false);
        };
        fetchClassAndStudents();
    }, [params.id]);


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Edit Class
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Class Details</CardTitle>
                    <CardDescription>Update the class's information.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                    ) : classItem && allStudents.length > 0 ? (
                        <EditClassForm classItem={classItem} allStudents={allStudents} />
                    ) : (
                        <p>Class not found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
