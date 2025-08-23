
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Discipline, Student, Class, Fee, Payment } from "@/lib/definitions";
import AddDisciplineForm from "@/components/admin/add-discipline-form";
import DisciplinesTable from "@/components/admin/disciplines-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookUser, Calendar, DollarSign, GraduationCap, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StudentsDataTab from "@/components/admin/students-data-tab";
import ClassesDataTab from "@/components/admin/classes-data-tab";
import FeesDataTab from "@/components/admin/fees-data-tab";
import PaymentsDataTab from "@/components/admin/payments-data-tab";

const disciplinesQuery = query(collection(db, "disciplines"));
const studentsQuery = query(collection(db, "students"));
const classesQuery = query(collection(db, "classes"));
const feesQuery = query(collection(db, "fees"));
const paymentsQuery = query(collection(db, "payments"));


export default function AdminPage() {
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [fees, setFees] = useState<Fee[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let loadedCount = 0;
        const totalQueries = 5;

        const handleLoad = () => {
            loadedCount++;
            if (loadedCount === totalQueries) {
                setLoading(false);
            }
        };

        const unsubscribes = [
            onSnapshot(disciplinesQuery, snapshot => {
                setDisciplines(snapshot.docs.map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data, createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() } as Discipline
                }));
                handleLoad();
            }, console.error),
            onSnapshot(studentsQuery, snapshot => {
                setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() } as Student)));
                handleLoad();
            }, console.error),
            onSnapshot(classesQuery, snapshot => {
                setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), scheduledDate: (doc.data().scheduledDate as Timestamp)?.toDate().toISOString() } as Class)));
                handleLoad();
            }, console.error),
            onSnapshot(feesQuery, snapshot => {
                setFees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), effectiveDate: (doc.data().effectiveDate as Timestamp)?.toDate().toISOString() } as Fee)));
                handleLoad();
            }, console.error),
            onSnapshot(paymentsQuery, snapshot => {
                setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), transactionDate: (doc.data().transactionDate as Timestamp)?.toDate().toISOString() } as Payment)));
                handleLoad();
            }, console.error),
        ];

        return () => unsubscribes.forEach(unsub => unsub());
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-headline font-bold text-foreground">
                Data Manager
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Database Records</CardTitle>
                    <CardDescription>View and manage all records in the database.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Tabs defaultValue="disciplines">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="disciplines"><BookUser className="mr-2 h-4 w-4"/>Disciplines ({disciplines.length})</TabsTrigger>
                        <TabsTrigger value="students"><GraduationCap className="mr-2 h-4 w-4"/>Students ({students.length})</TabsTrigger>
                        <TabsTrigger value="classes"><Calendar className="mr-2 h-4 w-4"/>Classes ({classes.length})</TabsTrigger>
                        <TabsTrigger value="fees"><DollarSign className="mr-2 h-4 w-4"/>Fees ({fees.length})</TabsTrigger>
                        <TabsTrigger value="payments"><CreditCard className="mr-2 h-4 w-4"/>Payments ({payments.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="disciplines" className="mt-4">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Add Discipline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AddDisciplineForm />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Existing Disciplines</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? <Skeleton className="h-64 w-full" /> : <DisciplinesTable disciplines={disciplines.filter(d => !d.deleted)} />}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="students" className="mt-4">
                        {loading ? <Skeleton className="h-64 w-full" /> : <StudentsDataTab students={students} />}
                    </TabsContent>
                    <TabsContent value="classes" className="mt-4">
                        {loading ? <Skeleton className="h-64 w-full" /> : <ClassesDataTab classes={classes} students={students} />}
                    </TabsContent>
                    <TabsContent value="fees" className="mt-4">
                        {loading ? <Skeleton className="h-64 w-full" /> : <FeesDataTab fees={fees} students={students} />}
                    </TabsContent>
                    <TabsContent value="payments" className="mt-4">
                        {loading ? <Skeleton className="h-64 w-full" /> : <PaymentsDataTab payments={payments} students={students} />}
                    </TabsContent>
                   </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
