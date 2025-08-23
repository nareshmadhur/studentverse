
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Edit, Plus, Users, User, Clock, MapPin, Trash2 } from "lucide-react";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import { Class, Student } from "@/lib/definitions";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { DayPicker, DayProps, DayContent } from "react-day-picker";
import { cn } from "@/lib/utils";

interface ClassCalendarProps {
  classes: Class[];
  students: Student[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function ClassCalendar({ classes, students, selectedDate, onDateSelect }: ClassCalendarProps) {
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
  
  const DayWithEvents = (props: DayProps) => {
    const { date } = props;
    const dayKey = format(date, "yyyy-MM-dd");
    const dayEvents = events.get(dayKey) || [];

    return (
        <div className="relative">
            <DayContent {...props} />
             {dayEvents.length > 0 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event, i) => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
                    ))}
                </div>
            )}
        </div>
    );
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className="p-4"
      components={{
        Day: DayWithEvents,
        DayContent: DayContent,
      }}
    />
  );
}
