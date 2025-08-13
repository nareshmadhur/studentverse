
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
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const testSchema = z.object({
  dateOne: z.date({ required_error: "A date is required." }),
  dateTwo: z.date({ required_error: "A date is required." }),
  dateThree: z.date({ required_error: "A date is required." }),
});

type TestFormValues = z.infer<typeof testSchema>;

export default function DatepickerTestPage() {
  const { toast } = useToast();

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
        dateOne: new Date(),
        dateTwo: new Date(),
        dateThree: new Date(),
    },
  });

  const onSubmit = (data: TestFormValues) => {
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
    <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">
            Date Picker Test
        </h1>
        <Card>
            <CardHeader>
                <CardTitle>Test Form</CardTitle>
                <CardDescription>A form with multiple date pickers to test functionality in isolation.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                    control={form.control}
                    name="dateOne"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date Picker One</FormLabel>
                        <FormControl>
                            <DatePicker field={field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="dateTwo"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date Picker Two</FormLabel>
                        <FormControl>
                           <DatePicker field={field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="dateThree"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Date Picker Three</FormLabel>
                        <FormControl>
                           <DatePicker field={field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
