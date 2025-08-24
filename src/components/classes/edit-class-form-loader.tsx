
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, getDocs, collection, query, where, Timestamp } from "firebase/firestore";
import { db, getCollectionName } from "@/lib/firebase";
import { Class, Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import EditClassForm from "@/components/classes/edit-class-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditClassFormLoader({ classId, onFinished }: { classId: string, onFinished: () => void }) {
    const [classItem, setClassItem] = useState<Class | null>(null);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classId) return;

        const fetchClassAndStudents = async () => {
            setLoading(true);
            try {
                const classDocRef = doc(db, getCollectionName("classes"), classId);
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

                const studentQuery = query(collection(db, getCollectionName("students")), where("deleted", "==", false));
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
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClassAndStudents();
    }, [classId]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" onClick={onFinished}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <CardTitle>Edit Class</CardTitle>
                        <CardDescription>Update the class's information.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                     </div>
                ) : classItem && allStudents.length > 0 ? (
                    <EditClassForm classItem={classItem} allStudents={allStudents} onFinished={onFinished} />
                ) : (
                    <p>Class not found.</p>
                )}
            </CardContent>
        </Card>
    );
}
