
"use client";

import AddClassForm from "@/components/classes/add-class-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState, useContext } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db, getCollectionName } from "@/lib/firebase";
import { Student } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { AppContext } from "../../layout";

function NewClassPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const preselectedStudentId = searchParams.get('studentId');
    const { environment } = useContext(AppContext);

    useEffect(() => {
        const fetchStudents = async () => {
          const studentQuery = query(collection(db, getCollectionName("students", environment)), where("deleted", "==", false));
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
        }
        fetchStudents();
    }, [environment]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Add New Class
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Class Details</CardTitle>
                    <CardDescription>Enter the details for the new class.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-20 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    ) : allStudents.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            <p>You must add a student before you can create a class.</p>
                            <Button asChild className="mt-4">
                                <Link href="/students">Add Student</Link>
                            </Button>
                        </div>
                    ) : (
                        <AddClassForm allStudents={allStudents} preselectedStudentId={preselectedStudentId} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function NewClassPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewClassPageContent />
        </Suspense>
    )
}
