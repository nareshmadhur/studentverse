
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Student } from "@/lib/definitions";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StudentStatement from "@/components/billing/student-statement";
import { DateRange } from "react-day-picker";
import { startOfMonth } from "date-fns";

export default function BillingPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [statementParams, setStatementParams] = useState<{ studentId: string; dateRange: DateRange } | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      const studentQuery = query(
        collection(db, "students"),
        where("deleted", "==", false)
      );
      const studentSnapshot = await getDocs(studentQuery);
      const studentData: Student[] = studentSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Student)
      );
      setStudents(studentData);
    };

    fetchStudents();
  }, []);

  const handleGenerateStatement = () => {
    if (selectedStudentId && dateRange?.from && dateRange?.to) {
      setStatementParams({ studentId: selectedStudentId, dateRange });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-headline font-bold text-foreground">
        Billing & Statements
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Generate a Statement</CardTitle>
          <CardDescription>
            Select a student and a date range to generate their billing statement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="grid gap-2 flex-1">
              <label htmlFor="student-select" className="text-sm font-medium">Student</label>
              <Select onValueChange={setSelectedStudentId} value={selectedStudentId || ""}>
                <SelectTrigger id="student-select">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
               <label htmlFor="date-range" className="text-sm font-medium">Date Range</label>
              <DateRangePicker
                id="date-range"
                range={dateRange}
                onRangeChange={setDateRange}
                className="w-full sm:w-auto"
              />
            </div>
            <Button onClick={handleGenerateStatement} disabled={!selectedStudentId || !dateRange}>
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {statementParams && (
        <StudentStatement 
          studentId={statementParams.studentId} 
          dateRange={statementParams.dateRange}
        />
      )}
    </div>
  );
}
