
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Discipline, Student } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AddFeeForm from "./add-fee-form";

export default function InlineAddFeeForm({ student, onFinish }: { student: Student; onFinish: () => void }) {
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);

    useEffect(() => {
        const disciplinesQuery = query(collection(db, "disciplines"), where("deleted", "==", false));
        const unsubscribeDisciplines = onSnapshot(disciplinesQuery, snapshot => {
            setDisciplines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discipline)));
        });
        return () => unsubscribeDisciplines();
    }, []);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Add New Fee for {student.name}</CardTitle>
                        <CardDescription>Set the billing rate for a specific discipline and session type.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onFinish}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <AddFeeForm 
                    studentId={student.id} 
                    currencyCode={student.currencyCode} 
                    disciplines={disciplines}
                    onFinish={onFinish}
                />
            </CardContent>
        </Card>
    )
}
