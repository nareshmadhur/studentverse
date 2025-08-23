
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
import { Fee, Discipline } from "@/lib/definitions";
import { Input } from "../ui/input";
import { DatePicker } from "../ui/date-picker";

const feeSchema = z.object({
  discipline: z.string().optional(),
  sessionType: z.enum(["1-1", "group"]),
  feeType: z.enum(["hourly", "subscription"]),
  amount: z.coerce.number().positive("Amount must be positive."),
  effectiveDate: z.date({ required_error: "An effective date is required." }),
});

type FeeFormValues = z.infer<typeof feeSchema>;

export default function EditFeeForm({
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
      discipline: fee.discipline || '__any__',
      sessionType: fee.sessionType,
      feeType: fee.feeType,
      amount: fee.amount,
      effectiveDate: new Date(fee.effectiveDate),
    },
  });

  const onSubmit = async (data: FeeFormValues) => {
    try {
      const feeDocRef = doc(db, "fees", fee.id);
      await updateDoc(feeDocRef, {
        ...data,
        discipline: data.discipline === '__any__' ? '' : data.discipline,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                <FormLabel>Amount ({fee.currencyCode})</FormLabel>
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
                    <FormControl>
                      <DatePicker field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
              )}
            />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onFinish}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
}
