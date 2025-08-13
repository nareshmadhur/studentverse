
"use client"

import * as React from "react"
import { ControllerRenderProps } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { format, parseISO } from "date-fns"

interface DatePickerProps {
  field: ControllerRenderProps<any, any>;
}

export function DatePicker({ field }: DatePickerProps) {
  const { value, onChange, ...rest } = field;

  // Format the date for the input (YYYY-MM-DD)
  const formattedValue = value ? format(new Date(value), 'yyyy-MM-dd') : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // When the input changes, parse the string back to a Date object
    // for react-hook-form.
    const date = e.target.value ? parseISO(e.target.value) : null;
    onChange(date);
  };

  return (
    <Input
      type="date"
      value={formattedValue}
      onChange={handleChange}
      {...rest}
    />
  )
}
