
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { Class, Student } from "@/lib/definitions";
import { DayProps, DayContent } from "react-day-picker";
import { cn } from "@/lib/utils";


interface ClassCalendarProps {
  classes: Class[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

interface EventType {
  hasOneOnOne: boolean;
  hasGroup: boolean;
}

export function ClassCalendar({ classes, selectedDate, onDateSelect }: ClassCalendarProps) {

  const events = React.useMemo(() => {
    const eventMap = new Map<string, EventType>();
    classes.forEach((classItem) => {
      const day = format(new Date(classItem.scheduledDate), "yyyy-MM-dd");
      if (!eventMap.has(day)) {
        eventMap.set(day, { hasOneOnOne: false, hasGroup: false });
      }
      const dayInfo = eventMap.get(day)!;
      if (classItem.sessionType === '1-1') {
        dayInfo.hasOneOnOne = true;
      }
      if (classItem.sessionType === 'group') {
        dayInfo.hasGroup = true;
      }
    });
    return eventMap;
  }, [classes]);

  function DayWithEvents(props: DayProps) {
    const dayKey = format(props.date, "yyyy-MM-dd");
    const eventInfo = events.get(dayKey);

    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <DayContent {...props} />
        {eventInfo && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {eventInfo.hasOneOnOne && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
            {eventInfo.hasGroup && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <ShadCalendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className="p-4"
      components={{
        Day: DayWithEvents
      }}
    />
  );
}
