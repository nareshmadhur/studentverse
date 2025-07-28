"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentProfile({ id }: { id: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, "students", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setStudent({ id: docSnap.id, ...docSnap.data() } as Student);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleAddToNewClass = () => {
    router.push(`/classes?openDialog=true&studentId=${id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Student Profile
        </h1>
        <div className="w-24"></div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {loading ? <Skeleton className="h-8 w-48 mb-2" /> : <CardTitle>{student?.name}</CardTitle>}
              {loading ? <Skeleton className="h-4 w-64" /> : <CardDescription>{student?.email}</CardDescription>}
            </div>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleAddToNewClass}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Add to New Class
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-muted-foreground">Phone</p>
                <p>{student?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Country</p>
                <p>{student?.country}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Preferred Currency</p>
                <p>{student?.currencyCode}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
