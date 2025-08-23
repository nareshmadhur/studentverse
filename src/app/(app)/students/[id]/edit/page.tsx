
import EditStudentFormLoader from "@/components/students/edit-student-form-loader";
import BackButton from "@/components/layout/back-button";

export default function EditStudentPage({ params }: { params: { id: string } }) {
    const { id } = params;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <BackButton />
                <h1 className="text-3xl font-headline font-bold text-foreground">
                    Edit Student
                </h1>
            </div>
            <EditStudentFormLoader studentId={id} />
        </div>
    );
}
