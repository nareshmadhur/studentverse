
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

const disciplineSchema = z.object({
  name: z.string().min(1, "Discipline name is required"),
});

type DisciplineFormValues = z.infer<typeof disciplineSchema>;

export default function AddDisciplineForm() {
  const { toast } = useToast();
  const form = useForm<DisciplineFormValues>({
    resolver: zodResolver(disciplineSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: DisciplineFormValues) => {
    try {
      await addDoc(collection(db, "disciplines"), {
        name: data.name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deleted: false,
      });
      toast({
        title: "Discipline Added",
        description: `"${data.name}" has been successfully added.`,
      });
      form.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "There was an error adding the discipline.",
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
              <FormLabel>New Discipline Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Piano, Vocals" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Add Discipline</Button>
      </form>
    </Form>
  );
}
