
"use client";

import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
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
import { Fee, Discipline } from "@/lib/definitions";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";
import { TableCell, TableRow } from "../ui/table";
import { Save, X } from "lucide-react";

const feeSchema = z.object({
  discipline: z.string().optional(),
  sessionType: z.enum(["1-1", "group"]),
  feeType: z.enum(["hourly", "subscription"]),
  amount: z.coerce.number().positive("Amount must be positive."),
  effectiveDate: z.date({ required_error: "An effective date is required." }),
});

type FeeFormValues = z.infer<typeof feeSchema>;

export default function EditFeeTableRow({
  fee,
  disciplines,
  onFinish,
}: {
  fee: Fee;
  disciplines: Discipline[];
  onFinish: () => void;
}) {
  const { toast } = useToast();

  const form = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      discipline: fee.discipline || "__any__",
      sessionType: fee.sessionType,
      feeType: fee.feeType,
      amount: fee.amount,
      effectiveDate: new Date(fee.effectiveDate),
    },
  });

  const onSubmit = async (data: FeeFormValues) => {
    try {
      const feeDocRef = doc(db, getCollectionName("fees"), fee.id);
      await updateDoc(feeDocRef, {
        ...data,
        discipline: data.discipline === "__any__" ? "" : data.discipline,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: "Fee Updated",
        description: "The fee has been successfully updated.",
      });
      onFinish();
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
    <FormProvider {...form}>
      <TableRow>
        <TableCell>
            <FormField
                control={form.control}
                name="discipline"
                render={({ field }) => (
                <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select..." />
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
        </TableCell>
        <TableCell>
            <FormField
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select..." />
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
        </TableCell>
        <TableCell>
             <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </TableCell>
        <TableCell>
            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DatePicker field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
              )}
            />
        </TableCell>
        <TableCell className="text-right">
            <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="icon" onClick={form.handleSubmit(onSubmit)}><Save className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" onClick={onFinish}><X className="h-4 w-4"/></Button>
            </div>
        </TableCell>
      </TableRow>
    </FormProvider>
  );
}
