
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Discipline } from "@/lib/definitions";
import AddDisciplineForm from "@/components/admin/add-discipline-form";
import DisciplinesTable from "@/components/admin/disciplines-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);

    useEffect(() => {
        const disciplinesQuery = query(collection(db, "disciplines"), where("deleted", "==", false));
        const unsubscribeDisciplines = onSnapshot(disciplinesQuery, (snapshot) => {
            const disciplineData: Discipline[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    deleted: data.deleted,
                };
            });
            setDisciplines(disciplineData);
        });

        return () => {
            unsubscribeDisciplines();
        };
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-headline font-bold text-foreground">
                Admin Settings
            </h1>
             <Card>
                <CardHeader>
                    <CardTitle>Manage Disciplines</CardTitle>
                    <CardDescription>Add or remove disciplines that can be assigned to classes and fees.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        <div className="md:col-span-1">
                            <AddDisciplineForm />
                        </div>
                        <div className="md:col-span-2">
                           <DisciplinesTable disciplines={disciplines} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
