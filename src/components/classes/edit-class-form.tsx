
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { doc, serverTimestamp, updateDoc, getDocs, query, where, collection, Timestamp, onSnapshot } from "firebase/firestore";
import { db, getCollectionName } from "@/lib/firebase";
import { Class, Student, Fee, Discipline } from "@/lib/definitions";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { DatePicker } from "../ui/date-picker";

const classSchema = z.object({
  title: z.string().min(1, "Title is required"),
  discipline: z.string().min(1, "Discipline is required"),
  sessionType: z.enum(["1-1", "group"]),
  description: z.string().optional(),
  scheduledDate: z.date({ required_error: "A class date and time is required." }),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute."),
  location: z.string().optional(),
  students: z.array(z.string()).min(1, "At least one student is required."),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface StudentFeeInfo {
  student: Student;
  fee: Fee | null;
  loading: boolean;
}

export default function EditClassForm({
  classItem,
  allStudents,
  onFinished,
}: {
  classItem: Class;
  allStudents: Student[];
  onFinished: () => void;
}) {
  const { toast } = useToast();
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(classItem.students || []);
  const [studentFeeDetails, setStudentFeeDetails] = useState<StudentFeeInfo[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      ...classItem,
      scheduledDate: new Date(classItem.scheduledDate),
    },
  });

  const { watch, setValue, getValues, control } = form;
  const watchedDiscipline = watch("discipline");
  const watchedSessionType = watch("sessionType");
  const watchedScheduledDate = watch("scheduledDate");

  useEffect(() => {
    const q = query(collection(db, getCollectionName("disciplines")), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const disciplineData: Discipline[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discipline));
        setDisciplines(disciplineData);
    });
    return () => unsubscribe();
  }, []);

  const fetchFeesForSelectedStudents = useCallback(async () => {
    const scheduledDate = getValues("scheduledDate");
    if (selectedStudentIds.length === 0 || !watchedDiscipline || !watchedSessionType || !scheduledDate) {
      setStudentFeeDetails([]);
      return;
    }
  
    const detailPromises = selectedStudentIds.map(async (studentId) => {
      const student = allStudents.find(s => s.id === studentId);
      if (!student) return null;
  
      const feeQuery = query(
        collection(db, getCollectionName("fees")),
        where("studentId", "==", studentId),
        where("sessionType", "==", watchedSessionType),
        where("feeType", "==", "hourly"),
        where("effectiveDate", "<=", Timestamp.fromDate(new Date(scheduledDate))),
        where("discipline", "in", [watchedDiscipline, ""]),
        where("deleted", "==", false)
      );
  
      const querySnapshot = await getDocs(feeQuery);
      let applicableFee: Fee | null = null;
  
      if (!querySnapshot.empty) {
        const fees: Fee[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), effectiveDate: (doc.data().effectiveDate as Timestamp).toDate().toISOString() } as Fee));
  
        fees.sort((a, b) => {
          if (a.discipline === watchedDiscipline && b.discipline !== watchedDiscipline) return -1;
          if (b.discipline === watchedDiscipline && a.discipline !== watchedDiscipline) return 1;
          return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
        });
        applicableFee = fees[0];
      }
      
      return { student, fee: applicableFee, loading: false };
    });
    
    const newDetails = (await Promise.all(detailPromises)).filter((detail): detail is StudentFeeInfo => detail !== null);
    setStudentFeeDetails(newDetails);
  }, [selectedStudentIds, watchedDiscipline, watchedSessionType, allStudents, getValues]);

  useEffect(() => {
    fetchFeesForSelectedStudents();
  }, [selectedStudentIds, watchedDiscipline, watchedSessionType, watchedScheduledDate, fetchFeesForSelectedStudents]);


  const onSubmit = async (data: ClassFormValues) => {
    try {
      const classDocRef = doc(db, getCollectionName("classes"), classItem.id);
      await updateDoc(classDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Class Updated",
        description: "The class has been successfully updated.",
      });
      onFinished();
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: "Error",
        description: "There was an error updating the class. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleStudentSelect = (studentId: string) => {
    const isSelected = selectedStudentIds.includes(studentId);
    let newSelectedIds: string[];

    if (watchedSessionType === '1-1') {
      newSelectedIds = isSelected ? [] : [studentId];
    } else {
      newSelectedIds = isSelected
          ? selectedStudentIds.filter(id => id !== studentId)
          : [...selectedStudentIds, studentId]
    }
    setSelectedStudentIds(newSelectedIds);
    setValue("students", newSelectedIds);
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Intro to Vocals" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="discipline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discipline</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a discipline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {disciplines.map(d => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1">
          <FormField
            control={control}
            name="sessionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a session type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1-1">1-1</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter class details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="scheduledDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Class Date & Time</FormLabel>
                  <FormControl>
                    <DatePicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
            )}
          />
          <FormField
            control={control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (in minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 60" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
            control={control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Room A1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="students"
            render={() => (
              <FormItem className="flex flex-col">
                <FormLabel>Students</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={!watchedDiscipline || !watchedSessionType}
                    >
                      {selectedStudentIds.length > 0
                        ? `${selectedStudentIds.length} student(s) selected`
                        : "Select students..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search students..." />
                      <CommandList>
                        <CommandEmpty>No students found.</CommandEmpty>
                        <CommandGroup>
                          {allStudents.map((student) => {
                            const isSelected = selectedStudentIds.includes(student.id);
                            return (
                             <CommandItem
                                key={student.id}
                                value={student.id}
                                onSelect={() => handleStudentSelect(student.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {student.name}
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {studentFeeDetails.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Student Details & Fees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentFeeDetails.map(({ student, fee, loading }) => (
                <div key={student.id} className="flex justify-between items-center p-2 rounded-md border">
                  <span>{student.name}</span>
                  {loading ? (
                    <span>Loading fee...</span>
                  ) : fee ? (
                    <Badge variant="secondary">{fee.amount} {fee.currencyCode}</Badge>
                  ) : (
                    <Badge variant="outline">No fee found</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onFinished}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
