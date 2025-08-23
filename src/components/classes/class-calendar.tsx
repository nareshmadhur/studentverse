
"use client";

import * as React from "react";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
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

  const modifiers = {
    oneOnOne: oneOnOneDays,
    group: groupDays,
  };

  const modifiersStyles = {
    oneOnOne: {
      // Using a pseudo-element for the dot to avoid interfering with clicks
      position: "relative",
      '--dot-color': "hsl(var(--primary))",
    } as React.CSSProperties,
    group: {
      position: "relative",
      '--dot-color-group': "hsl(var(--accent))",
    } as React.CSSProperties,
  };
  
  const DayContentWithDots: React.FC<React.PropsWithChildren<{ date: Date }>> = ({ date, children }) => {
    const isOneOnOne = oneOnOneDays.some(d => d.toDateString() === date.toDateString());
    const isGroup = groupDays.some(d => d.toDateString() === date.toDateString());

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {children}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {isOneOnOne && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
          {isGroup && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
        </div>
      </div>
    );
  };

  return (
    <ShadCalendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className="p-4"
      components={{
        DayContent: DayContentWithDots
      }}
    />
  );
}
