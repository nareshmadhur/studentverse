
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const currencySchema = z.object({
  name: z.string().min(1, "Currency name is required"),
  code: z.string().min(3, "Code must be 3 characters").max(3, "Code must be 3 characters"),
  symbol: z.string().min(1, "Symbol is required"),
});

type CurrencyFormValues = z.infer<typeof currencySchema>;

export default function AddCurrencyForm() {
  const { toast } = useToast();
  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      name: "",
      code: "",
      symbol: "",
    },
  });

  const onSubmit = async (data: CurrencyFormValues) => {
    try {
      await addDoc(collection(db, "currencies"), {
        ...data,
        code: data.code.toUpperCase(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deleted: false,
      });
      toast({
        title: "Currency Added",
        description: `"${data.name}" has been successfully added.`,
      });
      form.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "There was an error adding the currency.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., US Dollar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>3-Letter Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., USD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input placeholder="e.g., $" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Add Currency</Button>
      </form>
    </Form>
  );
}
