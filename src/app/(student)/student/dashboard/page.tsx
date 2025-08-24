
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { db, getCollectionName } from "@/lib/firebase";
import { Student, Class, Payment } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getBillingSummary } from "@/lib/actions/billing";
import { DateRange } from "react-day-picker";
import { endOfYear } from "date-fns";

export default function StudentDashboardPage() {
    const { user } = useAuth();
    const [student, setStudent] = useState<Student | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;

        let unsubscribers: (() => void)[] = [];

        const fetchStudentData = () => {
            const studentQuery = query(collection(db, getCollectionName("students")), where("email", "==", user.email));
            const studentUnsub = onSnapshot(studentQuery, (snapshot) => {
                if (!snapshot.empty) {
                    const studentData = snapshot.docs[0].data() as Student;
                    studentData.id = snapshot.docs[0].id;
                    setStudent(studentData);
                    
                    // After getting student, fetch related data
                    fetchRelatedData(studentData.id);
                } else {
                    setLoading(false);
                }
            });
            unsubscribers.push(studentUnsub);
        };
        
        const fetchRelatedData = (studentId: string) => {
            const classesQuery = query(collection(db, getCollectionName("classes")), where("students", "array-contains", studentId), where("deleted", "==", false));
            const classesUnsub = onSnapshot(classesQuery, (snapshot) => {
                setClasses(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, scheduledDate: (doc.data().scheduledDate as Timestamp).toDate().toISOString() } as Class)));
            });

            const paymentsQuery = query(collection(db, getCollectionName("payments")), where("studentId", "==", studentId), where("deleted", "==", false));
            const paymentsUnsub = onSnapshot(paymentsQuery, (snapshot) => {
                setPayments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, transactionDate: (doc.data().transactionDate as Timestamp).toDate().toISOString() } as Payment)));
            });

            const dateRange: DateRange = { from: new Date(2000, 0, 1), to: endOfYear(new Date()) };
            getBillingSummary(dateRange).then(summary => {
                const studentDetails = summary.studentDetails.find(d => d.studentId === studentId);
                setBalance(studentDetails?.balance || 0);
            });

            unsubscribers.push(classesUnsub, paymentsUnsub);
            setLoading(false);
        };

        fetchStudentData();

        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    const upcomingClasses = useMemo(() => {
        return classes
            .filter(c => new Date(c.scheduledDate) >= new Date())
            .sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
            .slice(0, 5);
    }, [classes]);

    if (loading) {
        return <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid md:grid-cols-3 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-64" />
        </div>;
    }

    if (!student) {
        return <div>Could not find student information.</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-headline font-bold text-foreground">
                Welcome, {student.name}!
            </h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
                        <span className="text-muted-foreground">{upcomingClasses.length}</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Next: {upcomingClasses.length > 0 ? format(new Date(upcomingClasses[0].scheduledDate), "MMM dd") : "None"}</div>
                        <p className="text-xs text-muted-foreground">You have {classes.length} total classes scheduled.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
                        <span className="text-muted-foreground">{getCurrencySymbol(student.currencyCode)}</span>
                    </CardHeader>
                    <CardContent>
                         {balance !== null ? (
                            <div className="text-2xl font-bold">{getCurrencySymbol(student.currencyCode)}{balance.toFixed(2)}</div>
                         ) : (
                            <Skeleton className="h-8 w-24" />
                         )}
                        <p className="text-xs text-muted-foreground">Based on all-time billing and payments.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Next 5 Classes</CardTitle>
                    <CardDescription>Here are your upcoming scheduled classes.</CardDescription>
                </CardHeader>
                <CardContent>
                     {upcomingClasses.length > 0 ? (
                        <div className="space-y-4">
                        {upcomingClasses.map(c => (
                            <div key={c.id} className="p-4 border rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-lg">{c.title}</p>
                                    <p className="text-sm text-muted-foreground">{c.discipline}</p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(c.scheduledDate), 'PPPP p')}</p>
                                </div>
                                <Badge variant={c.sessionType === '1-1' ? 'secondary' : 'default'}>{c.sessionType}</Badge>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                        <p>No upcoming classes. Enjoy your break!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
