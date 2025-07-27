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
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Fee, Enrollment, Student, Lesson } from "@/lib/definitions";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "../ui/input";

const feeSchema = z.object({
  enrollmentId: z.string().min(1, "Enrollment is required"),
  amount: z.coerce.number().positive("Amount must be positive."),
  dueDate: z.date({ required_error: "A due date is required." }),
  status: z.enum(["pending", "paid", "overdue"]),
});

type FeeFormValues = z.infer<typeof feeSchema>;

export default function EditFeeForm({
  setOpen,
  fee,
  enrollments,
  students,
  lessons,
}: {
  setOpen: (open: boolean) => void;
  fee: Fee;
  enrollments: Enrollment[];
  students: Student[];
  lessons: Lesson[];
}) {
  const { toast } = useToast();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const form = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      enrollmentId: fee.enrollmentId,
      amount: fee.amount,
      dueDate: new Date(fee.dueDate),
      status: fee.status,
    },
  });

  const onSubmit = async (data: FeeFormValues) => {
    try {
      const feeDocRef = doc(db, "fees", fee.id);
      await updateDoc(feeDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Fee Updated",
        description: "The fee has been successfully updated.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: "Error",
        description: "There was an error updating the fee. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="enrollmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enrollment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an enrollment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {enrollments.map(enrollment => {
                    const student = students.find(s => s.id === enrollment.studentId);
                    const lesson = lessons.find(l => l.id === enrollment.lessonId);
                    return (
                      <SelectItem key={enrollment.id} value={enrollment.id}>
                        {student?.name} - {lesson?.title}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Button
                type="button"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground"
                )}
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
              {isDatePickerOpen && (
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    if(date){
                      field.onChange(date);
                      setIsDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
