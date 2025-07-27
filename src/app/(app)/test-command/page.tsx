
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Beaker } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Mock data to avoid dependency on Firestore
const mockStudents = [
  { id: "s1", name: "Alice" },
  { id: "s2", name: "Bob" },
  { id: "s3", name: "Charlie" },
  { id: "s4", name: "Diana" },
];

export default function TestCommandPage() {
  const [sessionType, setSessionType] = useState<"1-1" | "group">("1-1");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleSelect = (studentId: string) => {
    if (sessionType === "1-1") {
      setSelectedStudents((current) =>
        current.includes(studentId) ? [] : [studentId]
      );
       // Close the popover after selection in 1-1 mode.
      setOpen(false);
    } else {
      setSelectedStudents((current) =>
        current.includes(studentId)
          ? current.filter((id) => id !== studentId)
          : [...current, studentId]
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
          <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-2">
            <Beaker className="h-8 w-8 text-primary"/>
            Component Test Lab
          </h1>
        </div>

      <Card>
        <CardHeader>
            <CardTitle>Student Selector Test</CardTitle>
            <CardDescription>Use this isolated environment to test the Command component's behavior.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>1. Choose Session Type</Label>
                <RadioGroup
                    value={sessionType}
                    onValueChange={(value: "1-1" | "group") => {
                        setSessionType(value);
                        setSelectedStudents([]); // Reset selection on change
                    }}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1-1" id="r1" />
                        <Label htmlFor="r1">1-1 Session</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="group" id="r2" />
                        <Label htmlFor="r2">Group Session</Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label>2. Select Student(s)</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[300px] justify-between"
                    >
                        {selectedStudents.length > 0
                        ? `${selectedStudents.length} student(s) selected`
                        : "Select students..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search students..." />
                        <CommandList>
                        <CommandEmpty>No students found.</CommandEmpty>
                        <CommandGroup>
                            {mockStudents.map((student) => {
                                const isSelected = selectedStudents.includes(student.id);
                                // This is the business logic check. We no longer pass a `disabled` prop.
                                const isEffectivelyDisabled = sessionType === '1-1' && selectedStudents.length > 0 && !isSelected;

                                return (
                                <CommandItem
                                    key={student.id}
                                    value={student.name}
                                    onSelect={() => {
                                        if (isEffectivelyDisabled) {
                                            return;
                                        }
                                        handleSelect(student.id);
                                    }}
                                    // The styling is now based on our logic, not a disabled prop.
                                    className={cn(isEffectivelyDisabled && "text-muted-foreground opacity-50 cursor-not-allowed")}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {student.name}
                                </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        </CommandList>
                    </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label>Current State:</Label>
                <pre className="text-sm p-4 bg-muted rounded-md">
                    <p>Session Type: {sessionType}</p>
                    <p>Selected Students: {JSON.stringify(selectedStudents)}</p>
                </pre>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
