"use client";

import type { Lesson } from "@/lib/definitions";
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

export default function LessonsTable({ lessons }: { lessons: Lesson[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Lessons</CardTitle>
        <CardDescription>
          A list of all lessons offered in your system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lesson Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.lesson_id}>
                <TableCell className="font-medium">{lesson.lesson_name}</TableCell>
                <TableCell>
                  <Badge variant={lesson.lesson_type === '1-1' ? 'secondary' : 'default'}>
                    {lesson.lesson_type}
                  </Badge>
                </TableCell>
                <TableCell>{lesson.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
