import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import LessonsTable from "@/components/lessons/lessons-table";
import { dummyLessons } from "@/lib/data";

export default function LessonsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold text-foreground">
          Lessons
        </h1>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Lesson
        </Button>
      </div>
      <LessonsTable lessons={dummyLessons} />
    </div>
  );
}
