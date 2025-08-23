
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { collection, onSnapshot, query, where, Timestamp, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student, Class } from "@/lib/definitions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, User, Users, UserX, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { addMonths, startOfDay } from "date-fns";
import StudentProfile from "@/components/students/student-profile";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import AddStudentForm from "@/components/students/add-student-form";
import InlineAddFeeForm from "@/components/fees/inline-add-fee-form";

function StudentListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedStudentId = searchParams.get('id');

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'profile' | 'addStudent' | 'addFee'>('profile');
  const [studentForFee, setStudentForFee] = useState<Student | null>(null);

  useEffect(() => {
    setLoading(true);
    const studentsQuery = query(collection(db, "students"), where("deleted", "==", false), orderBy("name"));
    const classesQuery = query(collection(db, "classes"), where("deleted", "==", false), orderBy("scheduledDate", "desc"));

    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentData: Student[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          country: data.country,
          currencyCode: data.currencyCode,
          createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
          deleted: data.deleted,
        };
      });
      setStudents(studentData);
      if (view === 'profile' && !selectedStudentId && studentData.length > 0) {
        router.replace(`/students?id=${studentData[0].id}`, { scroll: false });
      }
      setLoading(false);
    });

    const unsubscribeClasses = onSnapshot(classesQuery, (snapshot) => {
      const classData: Class[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledDate: (data.scheduledDate as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        } as Class;
      });
      setClasses(classData);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeClasses();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    // If a student is selected, but not in the list (e.g. deep link to deleted student), redirect
    if (selectedStudentId && !loading && students.length > 0 && !students.find(s => s.id === selectedStudentId)) {
        router.replace(`/students?id=${students[0].id}`, { scroll: false });
    }
  }, [selectedStudentId, students, loading, router]);


  const studentClassMap = useMemo(() => {
    const map = new Map<string, Date>();
    classes.forEach(c => {
      c.students.forEach(studentId => {
        const classDate = new Date(c.scheduledDate);
        if (!map.has(studentId) || classDate > map.get(studentId)!) {
          map.set(studentId, classDate);
        }
      });
    });
    return map;
  }, [classes]);

  const threeMonthsAgo = useMemo(() => startOfDay(addMonths(new Date(), -3)), []);

  const { activeStudents, inactiveStudents } = useMemo(() => {
    const active: Student[] = [];
    const inactive: Student[] = [];
    students.forEach(student => {
      const lastClassDate = studentClassMap.get(student.id);
      if (lastClassDate && lastClassDate >= threeMonthsAgo) {
        active.push(student);
      } else {
        inactive.push(student);
      }
    });

    const sortFn = (a: Student, b: Student) => {
        const lastClassA = studentClassMap.get(a.id)?.getTime() || 0;
        const lastClassB = studentClassMap.get(b.id)?.getTime() || 0;
        return lastClassB - lastClassA;
    }

    active.sort(sortFn);
    inactive.sort(sortFn);

    return { activeStudents: active, inactiveStudents: inactive };
  }, [students, studentClassMap, threeMonthsAgo]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  const filteredActiveStudents = useMemo(() => {
    return activeStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [activeStudents, searchTerm]);

  const filteredInactiveStudents = useMemo(() => {
    return inactiveStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [inactiveStudents, searchTerm]);


  const handleStudentSelect = (id: string | null) => {
    setView('profile');
    setStudentForFee(null);
    const newPath = id ? `/students?id=${id}` : '/students';
    router.push(newPath, { scroll: false });
  };
  
  const handleAddClick = () => {
    setView('addStudent');
    if (selectedStudentId) {
      router.push('/students', { scroll: false });
    }
  };

  const handleFinishAddingStudent = (action: 'cancel' | 'addFee', newStudentId?: string) => {
    if (action === 'cancel') {
        setView('profile');
        if (students.length > 0) {
            router.push(`/students?id=${selectedStudentId || students[0].id}`, { scroll: false });
        }
    } else if (action === 'addFee' && newStudentId) {
        const newStudent = students.find(s => s.id === newStudentId);
        if (newStudent) {
            setStudentForFee(newStudent);
            setView('addFee');
            router.push(`/students?id=${newStudentId}`, { scroll: false });
        } else {
            // Edge case: student list hasn't updated yet. Wait and retry.
            setTimeout(() => {
                 const newStudent = students.find(s => s.id === newStudentId);
                 if (newStudent) {
                    setStudentForFee(newStudent);
                    setView('addFee');
                    router.push(`/students?id=${newStudentId}`, { scroll: false });
                 }
            }, 1000);
        }
    }
  }

  const handleFinishAddingFee = () => {
    setView('profile');
    setStudentForFee(null);
  }

  const StudentListItem = ({ student }: { student: Student }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={() => handleStudentSelect(student.id)}
        onKeyDown={(e) => e.key === 'Enter' && handleStudentSelect(student.id)}
        className={cn(
            "flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors",
            view === 'profile' && selectedStudentId === student.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
        )}
    >
        <Avatar>
            <AvatarFallback className={cn(view === 'profile' && selectedStudentId === student.id ? "bg-primary-foreground text-primary" : "")}>
                {student.name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
            <p className="font-semibold truncate">{student.name}</p>
            <p className={cn("text-xs truncate", view === 'profile' && selectedStudentId === student.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {student.email}
            </p>
        </div>
    </div>
  );

  const renderRightPanel = () => {
    switch (view) {
        case 'addStudent':
            return (
                <Card>
                    <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                        <CardTitle>Add New Student</CardTitle>
                        <CardDescription>Enter the details for the new student.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleFinishAddingStudent('cancel')}>
                        <X className="h-5 w-5" />
                        </Button>
                    </div>
                    </CardHeader>
                    <CardContent>
                        <AddStudentForm onFinish={handleFinishAddingStudent} />
                    </CardContent>
              </Card>
            );
        case 'addFee':
            if (studentForFee) {
                return <InlineAddFeeForm student={studentForFee} onFinish={handleFinishAddingFee} />;
            }
            return null; // Should not happen
        case 'profile':
        default:
            if (selectedStudentId) {
                return <StudentProfile id={selectedStudentId} />;
            }
            if (!loading && students.length === 0) {
              return (
                 <div className="flex items-center justify-center h-full rounded-lg bg-muted/50">
                    <div className="text-center text-muted-foreground">
                        <p>No students found. Add one to get started.</p>
                    </div>
                </div>
              )
            }
            return (
                <div className="flex items-center justify-center h-full rounded-lg bg-muted/50">
                    <div className="text-center text-muted-foreground">
                        {loading ? <p>Loading students...</p> : <p>Select a student to view their profile.</p>}
                    </div>
                </div>
            );
    }
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Left Column: Student List */}
        <div className="md:col-span-1 lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-headline font-bold text-foreground">
                    Students
                </h1>
                <Button onClick={handleAddClick} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add
                </Button>
            </div>
            <Input 
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Card className="flex-1 flex flex-col overflow-hidden">
                <Tabs defaultValue="all" className="flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-3 shrink-0 m-2">
                      <TabsTrigger value="all" className="flex gap-2"><Users className="h-4 w-4" /> All</TabsTrigger>
                      <TabsTrigger value="active" className="flex gap-2"><User className="h-4 w-4" /> Active</TabsTrigger>
                      <TabsTrigger value="inactive" className="flex gap-2"><UserX className="h-4 w-4" /> Inactive</TabsTrigger>
                  </TabsList>
                  <CardContent className="p-2 flex-1 overflow-y-auto">
                      <div className="space-y-2">
                         {loading ? (
                              Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className="flex items-center gap-4 p-2">
                                      <Skeleton className="h-10 w-10 rounded-full" />
                                      <div className="space-y-2 flex-1">
                                          <Skeleton className="h-4 w-3/4" />
                                          <Skeleton className="h-3 w-full" />
                                      </div>
                                  </div>
                              ))
                         ) : (
                          <>
                           <TabsContent value="all">
                              {filteredStudents.map(s => <StudentListItem key={s.id} student={s} />)}
                          </TabsContent>
                          <TabsContent value="active">
                              {filteredActiveStudents.map(s => <StudentListItem key={s.id} student={s} />)}
                          </TabsContent>
                          <TabsContent value="inactive">
                              {filteredInactiveStudents.map(s => <StudentListItem key={s.id} student={s} />)}
                          </TabsContent>
                          </>
                         )}
                      </div>
                  </CardContent>
                </Tabs>
            </Card>
        </div>

        {/* Right Column: Student Profile or Add Form */}
        <div className="md:col-span-2 lg:col-span-3 overflow-y-auto h-full">
           {renderRightPanel()}
        </div>
    </div>
  );
}

export default function StudentsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudentListPage />
        </Suspense>
    )
}

    