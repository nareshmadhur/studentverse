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
import { Payment, Fee, Student, Class } from "@/lib/definitions";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const paymentSchema = z.object({
  feeId: z.string().min(1, "Fee is required"),
  amount: z.coerce.number().positive("Amount must be positive."),
  paymentDate: z.date({ required_error: "A payment date is required." }),
  paymentMethod: z.enum(["card", "cash", "bank_transfer"]),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function EditPaymentForm({
  setOpen,
  payment,
  fees,
  students,
  classes,
}: {
  setOpen: (open: boolean) => void;
  payment: Payment;
  fees: Fee[];
  students: Student[];
  classes: Class[];
}) {
  const { toast } = useToast();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      feeId: payment.feeId,
      amount: payment.amount,
      paymentDate: new Date(payment.paymentDate),
      paymentMethod: payment.paymentMethod,
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      const paymentDocRef = doc(db, "payments", payment.id);
      await updateDoc(paymentDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Payment Updated",
        description: "The payment has been successfully updated.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: "Error",
        description: "There was an error updating the payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getFeeInfo = (feeId: string) => {
    const fee = fees.find(f => f.id === feeId);
    if (!fee) return { studentName: "Unknown", className: "Unknown", feeAmount: 0 };
    const student = students.find(s => s.id === fee.studentId);
    const c = classes.find(l => l.id === fee.classId);
    return {
      studentName: student?.name || "Default",
      className: c?.title || "Unknown Class",
      feeAmount: fee.amount
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="feeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a fee to pay" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {fees.map(fee => {
                    const { studentName, className, feeAmount } = getFeeInfo(fee.id);
                    return (
                      <SelectItem key={fee.id} value={fee.id}>
                        {studentName} - {className} (${feeAmount})
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
          name="paymentDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Payment Date</FormLabel>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                    <Button
                    type="button"
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
                </PopoverTrigger>
                <PopoverContent>
                    <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                    />
                </PopoverContent>
              </Popover>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
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
