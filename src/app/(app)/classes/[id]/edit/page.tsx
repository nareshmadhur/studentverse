
"use client";

import EditClassFormLoader from "@/components/classes/edit-class-form-loader";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditClassPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Edit Class
                </h1>
            </div>
            <EditClassFormLoader classId={id} />
        </div>
    );
}
