
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
import { addDoc, collection, serverTimestamp, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student, Discipline } from "@/lib/definitions";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useRouter } from "next/navigation";

const feeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  discipline: z.string().optional(),
  sessionType: z.enum(["1-1", "group"]),
  feeType: z.enum(["hourly", "subscription"]),
  amount: z.coerce.number().positive("Amount must be positive."),
  currencyCode: z.string(),
  effectiveDate: z.date({ required_error: "An effective date is required." }),
});

type FeeFormValues = z.infer<typeof feeSchema>;

export default function AddFeeForm({
  setOpen,
  students,
  preselectedStudentId,
}: {
  setOpen: (open: boolean) => void;
  students: Student[];
  preselectedStudentId?: string | null;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  
  const form = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      studentId: preselectedStudentId || "",
      discipline: "__any__",
      sessionType: "1-1",
      feeType: "hourly",
      amount: 0,
      currencyCode: "",
      effectiveDate: new Date(),
    },
  });

  const { watch, setValue } = form;
  const selectedStudentId = watch("studentId");
  
  useEffect(() => {
    if (preselectedStudentId) {
      form.setValue('studentId', preselectedStudentId);
    }
  }, [preselectedStudentId, form]);

  useEffect(() => {
    const student = students.find(s => s.id === selectedStudentId);
    if (student) {
      setValue("currencyCode", student.currencyCode);
    }
  }, [selectedStudentId, students, setValue]);

  useEffect(() => {
    const q = query(collection(db, "disciplines"), where("deleted", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const disciplineData: Discipline[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discipline));
        setDisciplines(disciplineData);
    });
    return () => unsubscribe();
  }, []);

  const onSubmit = async (data: FeeFormValues) => {
    try {
      await addDoc(collection(db, "fees"), {
        ...data,
        discipline: data.discipline === '__any__' ? '' : data.discipline,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deleted: false,
      });
      toast({
        title: "Fee Added",
        description: "The new fee has been successfully added.",
      });
      setOpen(false);
      router.push('/fees');
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "There was an error adding the fee. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!!preselectedStudentId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discipline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discipline (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a discipline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__any__">Any (Default)</SelectItem>
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
          <FormField
            control={form.control}
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
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="feeType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Fee Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a fee type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Effective Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                              format(field.value, "PPP")
                          ) : (
                              <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Add Fee</Button>
        </div>
      </form>
    </Form>
  );
}

    