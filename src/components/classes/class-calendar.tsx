
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Class } from "@/lib/definitions";

interface ClassCalendarProps {
  classes: Class[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function ClassCalendar({ classes, selectedDate, onDateSelect }: ClassCalendarProps) {
  const oneOnOneDays = React.useMemo(
    () =>
      classes
        .filter((c) => c.sessionType === "1-1")
        .map((c) => new Date(c.scheduledDate)),
    [classes]
  );

  const groupDays = React.useMemo(
    () =>
      classes
        .filter((c) => c.sessionType === "group")
        .map((c) => new Date(c.scheduledDate)),
    [classes]
  );

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className="p-4"
      oneOnOneDays={oneOnOneDays}
      groupDays={groupDays}
    />
  );
}
