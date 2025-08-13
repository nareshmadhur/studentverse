
"use client";

import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
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
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";

const testSchema = z.object({
  eventDate: z.date({ required_error: "A date is required." }),
  category: z.string().min(1, "Category is required"),
});

type TestFormValues = z.infer<typeof testSchema>;

export default function DatePickerTestPage() {
  const { toast } = useToast();
  const [fetchedData, setFetchedData] = useState<string | null>(null);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      eventDate: new Date(),
      category: "music",
    },
  });

  const { watch } = form;
  const watchedDate = watch("eventDate");
  const watchedCategory = watch("category");

  useEffect(() => {
    console.log("Effect triggered. Watched date:", watchedDate, "Watched category:", watchedCategory);
    const fetchData = () => {
        setFetchedData(`Data fetched for ${watchedCategory} on ${watchedDate.toLocaleDateString()}`);
    };
    fetchData();
  }, [watchedDate, watchedCategory]);

  const onSubmit = (data: TestFormValues) => {
    console.log("Form Submitted", data);
    toast({
      title: "Form Submitted",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Date Picker Test Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <DatePicker field={field} />
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />

            {fetchedData && (
                <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">{fetchedData}</p>
                </div>
            )}
            
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
