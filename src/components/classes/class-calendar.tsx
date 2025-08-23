
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Edit, Plus, Users, User, Clock, MapPin, Trash2 } from "lucide-react";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import { Class, Student } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { DayPicker, DayProps } from "react-day-picker";

interface ClassCalendarProps {
  classes: Class[];
  students: Student[];
}

export function ClassCalendar({ classes, students }: ClassCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const router = useRouter();
  const { toast } = useToast();

  const events = React.useMemo(() => {
    const eventMap = new Map<string, Class[]>();
    classes.forEach((classItem) => {
      const day = format(new Date(classItem.scheduledDate), "yyyy-MM-dd");
      if (!eventMap.has(day)) {
        eventMap.set(day, []);
      }
      eventMap.get(day)!.push(classItem);
    });
    return eventMap;
  }, [classes]);
  
  const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown';

  const handleDelete = async (classId: string) => {
    try {
      const classDocRef = doc(db, "classes", classId);
      await updateDoc(classDocRef, {
        deleted: true,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Class Deleted",
        description: "The class has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        title: "Error",
        description: "There was an error deleting the class.",
        variant: "destructive",
      });
    }
  };

  const DayWithEvents = ({ date, children, ...props }: DayProps) => {
    const dayKey = format(date, "yyyy-MM-dd");
    const dayEvents = events.get(dayKey) || [];

    const defaultButton = DayPicker.defaultProps.components?.Day?.({ date, children, ...props});

    if (dayEvents.length === 0) {
      return defaultButton;
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
            <div role="button" className="relative">
                {defaultButton}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
                    ))}
                </div>
            </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4">
            <h4 className="font-bold text-lg leading-none">{format(date, "EEEE, MMMM do")}</h4>
          </div>
          <Separator />
          <div className="p-2 max-h-64 overflow-y-auto">
            {dayEvents.length > 0 ? (
                dayEvents.sort((a,b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()).map(event => (
                    <div key={event.id} className="p-2 rounded-lg hover:bg-muted">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.discipline}</p>
                            </div>
                             <Badge variant={event.sessionType === '1-1' ? 'secondary' : 'default'}>
                                {event.sessionType}
                            </Badge>
                        </div>
                        <Separator className="my-2" />
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(event.scheduledDate), "p")} ({event.durationMinutes} min)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {event.sessionType === '1-1' ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                                <span>{event.students.map(getStudentName).join(', ')}</span>
                            </div>
                             {event.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.location}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <Link href={`/classes/${event.id}/edit`}><Edit className="h-4 w-4" /></Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the class.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(event.id)}>
                                        Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground p-2">No classes scheduled for this day.</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="p-4"
      components={{
        Day: DayWithEvents
      }}
    />
  );
}
