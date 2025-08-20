
"use client";

import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

// --- Test Case 1: Simple Form ---
const simpleSchema = z.object({
  eventDate: z.date(),
});
type SimpleFormValues = z.infer<typeof simpleSchema>;

function SimpleForm() {
  const { toast } = useToast();
  const form = useForm<SimpleFormValues>({
    resolver: zodResolver(simpleSchema),
    defaultValues: { eventDate: new Date() },
  });

  const onSubmit = (data: SimpleFormValues) => {
    toast({ title: "Simple Form Submitted", description: JSON.stringify(data) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test 1: Simple Date Picker</CardTitle>
        <CardDescription>A form with only a date picker to confirm baseline functionality.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// --- Test Case 2: Form with Dependency ---
const dependentSchema = z.object({
  eventDate: z.date(),
  category: z.string().min(1, "Category is required"),
});
type DependentFormValues = z.infer<typeof dependentSchema>;

function DependentForm() {
  const { toast } = useToast();
  const [relatedData, setRelatedData] = useState<string | null>(null);
  const form = useForm<DependentFormValues>({
    resolver: zodResolver(dependentSchema),
    defaultValues: { eventDate: new Date(), category: "" },
  });

  const watchedCategory = form.watch("category");

  useEffect(() => {
    if (watchedCategory) {
      setRelatedData(`Data fetched for category: ${watchedCategory}`);
    } else {
      setRelatedData(null);
    }
  }, [watchedCategory]);

  const onSubmit = (data: DependentFormValues) => {
    toast({ title: "Dependent Form Submitted", description: JSON.stringify(data) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test 2: Date Picker with Unrelated Dependency</CardTitle>
        <CardDescription>A `useEffect` hook depends on the dropdown, but not the date picker. This tests for indirect interference.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {relatedData && <p className="text-sm text-muted-foreground">{relatedData}</p>}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// --- Test Case 3: Replicating the Conflict ---
const conflictSchema = z.object({
  eventDate: z.date(),
  category: z.string().min(1, "Category is required"),
});
type ConflictFormValues = z.infer<typeof conflictSchema>;

function ConflictForm() {
    const { toast } = useToast();
    const [relatedData, setRelatedData] = useState<string | null>(null);
    const form = useForm<ConflictFormValues>({
        resolver: zodResolver(conflictSchema),
        defaultValues: { eventDate: new Date(), category: "music" },
    });

    const watchedDate = form.watch("eventDate");
    const watchedCategory = form.watch("category");

    useEffect(() => {
        const dateStr = watchedDate?.toISOString().split('T')[0];
        setRelatedData(`Data fetched for category "${watchedCategory}" on ${dateStr}`);
    }, [watchedDate, watchedCategory]);

    const onSubmit = (data: ConflictFormValues) => {
        toast({ title: "Conflict Form Submitted", description: JSON.stringify(data) });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test 3: Replicating the Conflict</CardTitle>
        <CardDescription>A `useEffect` hook depends on both the date picker and the dropdown, exactly like the failing forms.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {relatedData && <p className="text-sm text-muted-foreground">{relatedData}</p>}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


export default function DatePickerTestPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-headline font-bold text-foreground">
                Date Picker Debugging Page
            </h1>
            <p className="text-muted-foreground">This page contains isolated test cases to debug the date picker component.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SimpleForm />
                <DependentForm />
                <ConflictForm />
            </div>
        </div>
    )
}
