"use client";

import type { Student } from "@/lib/definitions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function StudentsTable({ students }: { students: Student[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Students</CardTitle>
        <CardDescription>
          A list of all students in your system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead className="text-right">Currency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.student_id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell className="hidden md:table-cell">{student.phone}</TableCell>
                <TableCell className="hidden sm:table-cell">{student.location}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline">{student.currency_code}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
