
"use client";

import StudentProfile from "@/components/students/student-profile";
import { useParams } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentProfilePage() {
    const params = useParams();
    const id = params.id as string;

    if (!id) {
        return (
            <div className="flex flex-col gap-6 items-center justify-center h-full">
                <p className="text-muted-foreground">Please select a student from the list.</p>
            </div>
        )
    }

    return <StudentProfile id={id} />;
}
