"use client";

import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const allStudents = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
  { id: "4", name: "David" },
];

export default function TestCommandPage() {
  const [sessionType, setSessionType] = useState<'1-1' | 'group'>('1-1');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleSelect = (studentId: string) => {
    if (sessionType === '1-1') {
      setSelectedStudents(prev => prev.includes(studentId) ? [] : [studentId]);
    } else {
      setSelectedStudents(prev =>
        prev.includes(studentId)
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Test Page for Command Component</h1>
      
      <RadioGroup value={sessionType} onValueChange={(value: '1-1' | 'group') => {
        setSessionType(value);
        setSelectedStudents([]);
      }}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1-1" id="r1" />
          <Label htmlFor="r1">1-1 Session</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="group" id="r2" />
          <Label htmlFor="r2">Group Session</Label>
        </div>
      </RadioGroup>

      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-[200px] justify-between"
            >
              {selectedStudents.length > 0
                ? `${selectedStudents.length} student(s) selected`
                : "Select students..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search students..." />
              <CommandList>
                <CommandEmpty>No students found.</CommandEmpty>
                <CommandGroup>
                  {allStudents.map((student) => {
                    const isSelected = selectedStudents.includes(student.id);
                    const isDisabled = sessionType === '1-1' && selectedStudents.length > 0 && !isSelected;

                    return (
                      <CommandItem
                        key={student.id}
                        value={student.id}
                        disabled={isDisabled}
                        onSelect={() => handleSelect(student.id)}
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

       <div>
        <h3 className="font-semibold">Current State:</h3>
        <p>Session Type: {sessionType}</p>
        <p>Selected Students: {JSON.stringify(selectedStudents)}</p>
      </div>
    </div>
  );
}
