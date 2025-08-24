
"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { doc, onSnapshot, Timestamp, updateDoc, serverTimestamp, getDocs, collection, query, where } from "firebase/firestore";
import { db, getCollectionName } from "@/lib/firebase";
import { Student, Class, Fee, Payment, Discipline } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Save, X, Trash2, AlertTriangle, Calendar, DollarSign, CreditCard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { currencies } from "@/lib/data/form-data";
import { getCurrencySymbol } from "@/lib/utils";
import EditStudentForm from "./edit-student-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import AddFeeTableRow from "../fees/add-fee-table-row";
import EditFeeTableRow from "../fees/edit-fee-form";


function StudentProfileContent({ id, isAddingFeeForNewStudent, onFeeAdded }: { id: string; isAddingFeeForNewStudent: boolean, onFeeAdded: () => void; }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);

  const activeTab = searchParams.get('tab') || 'classes';
  const [isAddingFee, setIsAddingFee] = useState(isAddingFeeForNewStudent);

  useEffect(() => {
    setIsAddingFee(isAddingFeeForNewStudent);
  }, [isAddingFeeForNewStudent]);


  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    const docRef = doc(db, getCollectionName("students"), id);
    const unsubscribeStudent = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStudent({ 
            id: docSnap.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Student);
      } else {
        setStudent(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching student:", error);
        setLoading(false);
    });

    const classesQuery = query(collection(db, getCollectionName("classes")), where("students", "array-contains", id), where("deleted", "==", false));
    const unsubscribeClasses = onSnapshot(classesQuery, snapshot => {
        setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), scheduledDate: (doc.data().scheduledDate as Timestamp).toDate().toISOString() } as Class)));
    });

    const feesQuery = query(collection(db, getCollectionName("fees")), where("studentId", "==", id), where("deleted", "==", false), where("feeType", "==", "hourly"));
    const unsubscribeFees = onSnapshot(feesQuery, snapshot => {
        setFees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), effectiveDate: (doc.data().effectiveDate as Timestamp).toDate().toISOString() } as Fee)));
    });

    const paymentsQuery = query(collection(db, getCollectionName("payments")), where("studentId", "==", id), where("deleted", "==", false));
    const unsubscribePayments = onSnapshot(paymentsQuery, snapshot => {
        setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), transactionDate: (doc.data().transactionDate as Timestamp).toDate().toISOString() } as Payment)));
    });

    const disciplinesQuery = query(collection(db, getCollectionName("disciplines")), where("deleted", "==", false));
    const unsubscribeDisciplines = onSnapshot(disciplinesQuery, snapshot => {
        setDisciplines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discipline)));
    });

    return () => {
      unsubscribeStudent();
      unsubscribeClasses();
      unsubscribeFees();
      unsubscribePayments();
      unsubscribeDisciplines();
    }
  }, [id]);

  const handleTabChange = (value: string) => {
    router.push(`/students?id=${id}&tab=${value}`, { scroll: false });
  };

  const upcomingClasses = useMemo(() => {
    return classes.filter(c => new Date(c.scheduledDate) >= new Date()).sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [classes]);

  const pastClasses = useMemo(() => {
    return classes.filter(c => new Date(c.scheduledDate) < new Date()).sort((a,b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [classes]);

  const handleDelete = async (collectionName: string, docId: string) => {
    try {
      await updateDoc(doc(db, getCollectionName(collectionName), docId), { deleted: true, updatedAt: serverTimestamp() });
      toast({ title: `${collectionName.slice(0, -1)} deleted`, description: `The item has been successfully marked as deleted.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not delete item.', variant: 'destructive' });
    }
  };

  const handleDeleteStudent = async () => {
    if (!student) return;
    try {
        await updateDoc(doc(db, getCollectionName('students'), student.id), { deleted: true, updatedAt: serverTimestamp() });
        toast({ title: 'Student Deleted', description: `${student.name} has been deleted.` });
        router.push('/students');
    } catch (error) {
        toast({ title: 'Error', description: 'Could not delete student.', variant: 'destructive' });
    }
  };


  const handleFeeAdded = () => {
    setIsAddingFee(false);
    onFeeAdded();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-full rounded-lg bg-muted/50">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">Student Not Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">The student you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
       <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{student?.name}</CardTitle>
              <CardDescription>{student?.email}</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <X className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete Student</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete {student.name} and all associated data.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteStudent}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {isEditing ? (
                <EditStudentForm student={student} onSave={() => setIsEditing(false)} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-muted-foreground">Phone</p>
                        <p className="text-lg">{student?.phone || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-muted-foreground">Country</p>
                        <p className="text-lg">{student?.country}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-muted-foreground">Preferred Currency</p>
                        <p className="text-lg">{currencies.find(c => c.code === student.currencyCode)?.name || 'N/A'} ({getCurrencySymbol(student.currencyCode)})</p>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
      
       <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="classes"><Calendar className="mr-2 h-4 w-4"/>Classes ({classes.length})</TabsTrigger>
          <TabsTrigger value="fees"><DollarSign className="mr-2 h-4 w-4" />Fee Structure ({fees.length})</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="mr-2 h-4 w-4" />Payments ({payments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="classes">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Classes</CardTitle>
                    <Button asChild size="sm">
                        <Link href={`/classes/new?studentId=${id}`}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Class
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold text-muted-foreground mb-2">Upcoming Classes</h3>
                    {upcomingClasses.length > 0 ? (
                        <div className="space-y-2">
                        {upcomingClasses.map(c => (
                            <div key={c.id} className="p-3 rounded-md border flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{c.title} <span className="text-normal text-muted-foreground">({c.discipline})</span></p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(c.scheduledDate), 'PPPP p')}</p>
                                </div>
                                <Badge variant={c.sessionType === '1-1' ? 'secondary' : 'default'}>{c.sessionType}</Badge>
                            </div>
                        ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No upcoming classes.</p>}
                     <h3 className="font-semibold text-muted-foreground mt-4 mb-2">Past Classes</h3>
                     {pastClasses.length > 0 ? (
                        <div className="space-y-2">
                        {pastClasses.slice(0,5).map(c => (
                            <div key={c.id} className="p-3 rounded-md border flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{c.title} <span className="text-normal text-muted-foreground">({c.discipline})</span></p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(c.scheduledDate), 'PPP')}</p>
                                </div>
                                <Badge variant={c.sessionType === '1-1' ? 'secondary' : 'default'}>{c.sessionType}</Badge>
                            </div>
                        ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No past classes.</p>}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="fees">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Fee Structure</CardTitle>
                        <CardDescription>Hourly rates for this student.</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setIsAddingFee(true)}><PlusCircle className="mr-2 h-4 w-4"/> Add Fee</Button>
                </CardHeader>
                <CardContent>
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Discipline</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Effective</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isAddingFee && (
                          <AddFeeTableRow
                            student={student}
                            disciplines={disciplines}
                            onFinish={handleFeeAdded}
                          />
                        )}
                        {fees.map(f => editingFeeId === f.id ? (
                            <EditFeeTableRow
                                key={f.id}
                                fee={f}
                                disciplines={disciplines}
                                onFinish={() => setEditingFeeId(null)}
                            />
                        ) : (
                           <TableRow key={f.id}>
                               <TableCell>{f.discipline || 'Any (Default)'}</TableCell>
                               <TableCell><Badge variant={f.sessionType === '1-1' ? 'secondary' : 'default'}>{f.sessionType}</Badge></TableCell>
                               <TableCell>{getCurrencySymbol(f.currencyCode)}{f.amount.toFixed(2)}</TableCell>
                               <TableCell>{format(new Date(f.effectiveDate), 'PPP')}</TableCell>
                               <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingFeeId(f.id)}><Pencil className="h-4 w-4"/></Button>
                                    <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will delete the fee record.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('fees', f.id)}>Continue</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                               </TableCell>
                           </TableRow>
                        ))}
                         {fees.length === 0 && !isAddingFee && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">No fees defined for this student.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="payments">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                     <div>
                        <CardTitle>Payments</CardTitle>
                        <CardDescription>History of payments received from this student.</CardDescription>
                    </div>
                    <Button size="sm" asChild>
                        <Link href={`/payments/new?studentId=${id}`}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Add Payment
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                     <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Notes</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {payments.map(p => (
                           <TableRow key={p.id}>
                               <TableCell>{format(new Date(p.transactionDate), 'PPP')}</TableCell>
                               <TableCell>{getCurrencySymbol(p.currencyCode)}{p.amount.toFixed(2)}</TableCell>
                               <TableCell>{p.paymentMethod}</TableCell>
                               <TableCell>{p.notes}</TableCell>
                               <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="icon"><Link href={`/payments/${p.id}/edit`}><Pencil className="h-4 w-4"/></Link></Button>
                                     <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will delete the payment record.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete('payments', p.id)}>Continue</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                               </TableCell>
                           </TableRow>
                        ))}
                         {payments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">No payments recorded for this student.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function StudentProfile({ id, isAddingFeeForNewStudent = false, onFeeAdded = () => {} }: { id: string; isAddingFeeForNewStudent?: boolean, onFeeAdded?: () => void }) {
    return (
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
            <StudentProfileContent id={id} isAddingFeeForNewStudent={isAddingFeeForNewStudent} onFeeAdded={onFeeAdded} />
        </Suspense>
    )
}
