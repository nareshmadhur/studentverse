
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Discipline, Currency } from "@/lib/definitions";
import AddDisciplineForm from "@/components/admin/add-discipline-form";
import DisciplinesTable from "@/components/admin/disciplines-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddCurrencyForm from "@/components/admin/add-currency-form";
import CurrenciesTable from "@/components/admin/currencies-table";

export default function AdminPage() {
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);

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

        const currenciesQuery = query(collection(db, "currencies"), where("deleted", "==", false));
        const unsubscribeCurrencies = onSnapshot(currenciesQuery, (snapshot) => {
            const currencyData: Currency[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    code: data.code,
                    symbol: data.symbol,
                    name: data.name,
                    createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                    deleted: data.deleted,
                };
            });
            setCurrencies(currencyData);
        });

        return () => {
            unsubscribeDisciplines();
            unsubscribeCurrencies();
        };
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-headline font-bold text-foreground">
                Admin Settings
            </h1>
            <Tabs defaultValue="disciplines">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="disciplines">Disciplines</TabsTrigger>
                    <TabsTrigger value="currencies">Currencies</TabsTrigger>
                </TabsList>
                <TabsContent value="disciplines">
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        <div className="md:col-span-1">
                            <AddDisciplineForm />
                        </div>
                        <div className="md:col-span-2">
                           <DisciplinesTable disciplines={disciplines} />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="currencies">
                    <div className="grid md:grid-cols-3 gap-6 mt-4">
                        <div className="md:col-span-1">
                            <AddCurrencyForm />
                        </div>
                        <div className="md:col-span-2">
                           <CurrenciesTable currencies={currencies} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
