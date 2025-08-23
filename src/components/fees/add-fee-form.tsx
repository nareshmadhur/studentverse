
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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Discipline } from "@/lib/definitions";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";

export const feeSchema = z.object({
  discipline: z.string().optional(),
  sessionType: z.enum(["1-1", "group"]),
  feeType: z.enum(["hourly", "subscription"]),
  amount: z.coerce.number().positive("Amount must be positive."),
  effectiveDate: z.date({ required_error: "An effective date is required." }),
});

export type FeeFormValues = z.infer<typeof feeSchema>;

export default function AddFeeForm({
  studentId,
  currencyCode,
  disciplines,
  onFinish,
  children,
}: {
  studentId: string;
  currencyCode: string;
  disciplines: Discipline[];
  onFinish: () => void;
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  
  const form = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      discipline: "__any__",
      sessionType: "1-1",
      feeType: "hourly",
      amount: 0,
      effectiveDate: new Date(),
    },
  });

  const onSubmit = async (data: FeeFormValues) => {
    try {
      await addDoc(collection(db, "fees"), {
        ...data,
        studentId,
        currencyCode,
        discipline: data.discipline === '__any__' ? '' : data.discipline,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deleted: false,
      });
      toast({
        title: "Fee Added",
        description: "The new fee has been successfully added.",
      });
      onFinish();
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {children}
      </form>
    </Form>
  );
}
