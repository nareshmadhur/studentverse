
"use client";

import { useState, useEffect, useContext } from "react";
import { collection, onSnapshot, query, Timestamp } from "firebase/firestore";
import { db, getCollectionName, type Environment } from "@/lib/firebase";
import { Discipline, Student, Class, Fee, Payment } from "@/lib/definitions";
import AddDisciplineForm from "@/components/admin/add-discipline-form";
import DisciplinesTable from "@/components/admin/disciplines-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookUser, Calendar, DollarSign, GraduationCap, CreditCard, ChevronsUpDown, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StudentsDataTab from "@/components/admin/students-data-tab";
import ClassesDataTab from "@/components/admin/classes-data-tab";
import FeesDataTab from "@/components/admin/fees-data-tab";
import PaymentsDataTab from "@/components/admin/payments-data-tab";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { AppContext } from "../layout";

const ENVIRONMENTS: Environment[] = ['development', 'pre-prod', 'production'];


export default function AdminPage() {
    const { environment, setEnvironment } = useContext(AppContext);
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [fees, setFees] = useState<Fee[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [openEnvSelector, setOpenEnvSelector] = useState(false);

    const handleEnvChange = (env: Environment) => {
        setEnvironment(env);
        localStorage.setItem('tutoraid-env', env);
        window.location.reload(); // Reload to fetch new data from the correct collections
    }


    useEffect(() => {
        setLoading(true);
        const disciplinesCol = getCollectionName("disciplines", environment);
        const studentsCol = getCollectionName("students", environment);
        const classesCol = getCollectionName("classes", environment);
        const feesCol = getCollectionName("fees", environment);
        const paymentsCol = getCollectionName("payments", environment);

        const queries = [
            onSnapshot(query(collection(db, disciplinesCol)), snapshot => {
                setDisciplines(snapshot.docs.map(doc => {
                    const data = doc.data();
                    return { id: doc.id, ...data, createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString() } as Discipline
                }));
            }, console.error),
            onSnapshot(query(collection(db, studentsCol)), snapshot => {
                setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString() } as Student)));
            }, console.error),
            onSnapshot(query(collection(db, classesCol)), snapshot => {
                setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), scheduledDate: (doc.data().scheduledDate as Timestamp)?.toDate().toISOString() || new Date().toISOString() } as Class)));
            }, console.error),
            onSnapshot(query(collection(db, feesCol)), snapshot => {
                setFees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), effectiveDate: (doc.data().effectiveDate as Timestamp)?.toDate().toISOString() || new Date().toISOString() } as Fee)));
            }, console.error),
            onSnapshot(query(collection(db, paymentsCol)), snapshot => {
                setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), transactionDate: (doc.data().transactionDate as Timestamp)?.toDate().toISOString() || new Date().toISOString() } as Payment)));
            }, console.error),
        ];

        // A simple way to track loading state for all queries
        const allQueriesPromise = Promise.all(queries.map(unsub => new Promise(resolve => {
            const unsubAndResolve = (...args: any[]) => {
                unsub(...args);
                resolve(true);
            };
            return unsubAndResolve;
        })));
        
        allQueriesPromise.finally(() => setLoading(false));

        return () => queries.forEach(unsub => unsub());
    }, [environment]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Data Manager
                </h1>
                <Popover open={openEnvSelector} onOpenChange={setOpenEnvSelector}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openEnvSelector} className="w-[200px] justify-between">
                        Environment: <span className="font-bold capitalize">{environment}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandGroup>
                                {ENVIRONMENTS.map((env) => (
                                    <CommandItem
                                        key={env}
                                        value={env}
                                        onSelect={(currentValue) => {
                                            handleEnvChange(currentValue as Environment)
                                            setOpenEnvSelector(false)
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", environment === env ? "opacity-100" : "opacity-0")} />
                                        <span className="capitalize">{env}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Database Records</CardTitle>
                    <CardDescription>View and manage all records in the <span className="font-bold capitalize">{environment}</span> database.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Tabs defaultValue="disciplines" className="w-full">
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
