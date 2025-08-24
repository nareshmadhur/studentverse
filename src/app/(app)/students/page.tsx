
"use client";

import { useState, useEffect, useMemo, Suspense, useContext } from "react";
import { collection, onSnapshot, query, where, Timestamp, orderBy } from "firebase/firestore";
import { db, getCollectionName } from "@/lib/firebase";
import { Student, Class } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { PlusCircle, User, Users, UserX, X, School } from "lucide-react";
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
import { AppContext } from "../layout";

function WelcomeGuide({ onAddStudentClick }: { onAddStudentClick: () => void }) {
  return (
    <Card className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <School className="mx-auto h-16 w-16 text-primary" />
        <h2 className="mt-6 text-2xl font-headline font-bold text-foreground">
          Welcome to Tutoraid!
        </h2>
        <p className="mt-4 text-muted-foreground">
          It looks like you're just getting started. The first step to managing your tutoring business is to add your students.
        </p>
        <p className="mt-2 text-muted-foreground">
          Once you have students, you can schedule classes, define fee structures, and track payments.
        </p>
        <Button onClick={onAddStudentClick} className="mt-6">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Your First Student
        </Button>
      </div>
    </Card>
  )
}

function StudentListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedStudentId = searchParams.get('id');
  const { environment } = useContext(AppContext);

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'profile' | 'addStudent'>('profile');
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const studentsQuery = query(collection(db, getCollectionName("students", environment)), where("deleted", "==", false), orderBy("name"));
    const classesQuery = query(collection(db, getCollectionName("classes", environment)), where("deleted", "==", false));

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
      setLoading(false);
    });

    const unsubscribeClasses = onSnapshot(classesQuery, (snapshot) => {
      const classData: Class[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledDate: (data.scheduledDate as Timestamp).toDate().toISOString(),
        } as Class;
      }).sort((a,b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
      setClasses(classData);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeClasses();
    };
  }, [environment]);

  // This hook handles the case where no student is selected, defaulting to the first.
  useEffect(() => {
    if (loading || students.length === 0 || selectedStudentId || view === 'addStudent' || pendingStudentId) {
      return;
    }
    // If we have students but none is selected, select the first one.
    router.replace(`/students?id=${students[0].id}`, { scroll: false });
  }, [loading, students, selectedStudentId, view, router, pendingStudentId]);

  // This hook handles navigating to the new student after they are created and loaded.
  useEffect(() => {
    if (pendingStudentId && students.find(s => s.id === pendingStudentId)) {
        router.push(`/students?id=${pendingStudentId}&tab=fees&isAddingFeeForNewStudent=true`, { scroll: false });
        setView('profile');
        setPendingStudentId(null); // Reset after navigation
    }
  }, [pendingStudentId, students, router]);


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
    const newPath = id ? `/students?id=${id}` : '/students';
    router.push(newPath, { scroll: false });
  };
  
  const handleAddClick = () => {
    setView('addStudent');
    if (selectedStudentId) {
      router.push('/students', { scroll: false });
    }
  };

  const handleFinishAddingStudent = (newStudentId?: string) => {
    if (newStudentId) {
        setPendingStudentId(newStudentId);
    } else {
        setView('profile');
    }
  }

  const StudentListItem = ({ student }: { student: Student }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={() => handleStudentSelect(student.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStudentSelect(student.id); }}
        className={cn(
            "flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
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
    if (loading) {
      return (
          <Card className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                  <p>Loading students...</p>
              </div>
          </Card>
      );
    }
    
    if (students.length === 0 && view !== 'addStudent') {
       return <WelcomeGuide onAddStudentClick={handleAddClick} />;
    }

    switch (view) {
        case 'addStudent':
            return (
                <Card className="flex-1">
                    <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                        <CardTitle>Add New Student</CardTitle>
                        <CardDescription>Enter the details for the new student.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleFinishAddingStudent()}>
                        <X className="h-5 w-5" />
                        </Button>
                    </div>
                    </CardHeader>
                    <CardContent>
                        <AddStudentForm onFinish={handleFinishAddingStudent} />
                    </CardContent>
              </Card>
            );
        case 'profile':
        default:
            if (selectedStudentId) {
                return <div className="flex-1"><StudentProfile id={selectedStudentId} /></div>;
            }
            return (
                <Card className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                        <p>Select a student to view their profile.</p>
                    </div>
                </Card>
            );
    }
  }


  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh_-_100px)] items-start">
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-headline font-bold text-foreground">
                    Students
                </h1>
                 {students.length > 0 && (
                    <Button onClick={handleAddClick} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add
                    </Button>
                 )}
            </div>
            {students.length > 0 && (
                <Input 
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            )}
            <Card className="flex-1 flex flex-col">
                <Tabs defaultValue="all" className="flex flex-col h-full">
                  <CardHeader className="p-2 pb-0">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all" className="flex gap-2"><Users className="h-4 w-4" /> All</TabsTrigger>
                        <TabsTrigger value="active" className="flex gap-2"><User className="h-4 w-4" /> Active</TabsTrigger>
                        <TabsTrigger value="inactive" className="flex gap-2"><UserX className="h-4 w-4" /> Inactive</TabsTrigger>
                    </TabsList>
                  </CardHeader>
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
                         ) : students.length > 0 ? (
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
                         ) : (
                           <div className="text-center text-muted-foreground p-8">
                             <p>No students yet.</p>
                              <Button onClick={handleAddClick} size="sm" className="mt-4">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add one
                              </Button>
                           </div>
                         )}
                      </div>
                  </CardContent>
                </Tabs>
            </Card>
        </div>

        <div className="flex-1 flex flex-col h-full overflow-y-auto">
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

    