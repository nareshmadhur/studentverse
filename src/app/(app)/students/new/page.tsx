
"use client";

import AddStudentForm from "@/components/students/add-student-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewStudentPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Add New Student
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Student Details</CardTitle>
                    <CardDescription>Enter the details for the new student.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AddStudentForm />
                </CardContent>
            </Card>
        </div>
    );
}
