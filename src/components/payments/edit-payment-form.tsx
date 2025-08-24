
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
import { db, getCollectionName } from "@/lib/firebase";
import { Payment, Student } from "@/lib/definitions";
import { useEffect, useContext } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../ui/date-picker";
import { useRouter } from "next/navigation";
import { AppContext } from "@/app/(app)/layout";

const paymentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  amount: z.coerce.number().positive("Amount must be positive."),
  currencyCode: z.string(),
  transactionDate: z.date({ required_error: "A payment date is required." }),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function EditPaymentForm({
  payment,
  students,
}: {
  payment: Payment;
  students: Student[];
}) {
  const { toast } = useToast();
  const router = useRouter();
  const { environment } = useContext(AppContext);
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      ...payment,
      transactionDate: new Date(payment.transactionDate),
    },
  });

  const { watch, setValue } = form;
  const selectedStudentId = watch("studentId");

  useEffect(() => {
    const student = students.find(s => s.id === selectedStudentId);
    if (student) {
      setValue("currencyCode", student.currencyCode);
    }
  }, [selectedStudentId, students, setValue]);


  const onSubmit = async (data: PaymentFormValues) => {
    try {
      const paymentDocRef = doc(db, getCollectionName("payments", environment), payment.id);
      await updateDoc(paymentDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Payment Updated",
        description: "The payment has been successfully updated.",
      });
      router.push("/payments");
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: "Error",
        description: "There was an error updating the payment. Please try again.",
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Card, Cash" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Transaction Date</FormLabel>
                <FormControl>
                  <DatePicker field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add any notes for this payment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
