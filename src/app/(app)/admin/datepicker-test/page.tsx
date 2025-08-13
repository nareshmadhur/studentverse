
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
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";

// --- Schema Definitions ---
const baseSchema = z.object({
  eventDate: z.date({ required_error: "A date is required." }),
});

const dependentSchema = baseSchema.extend({
  category: z.string().min(1, "Category is required"),
});

type BaseFormValues = z.infer<typeof baseSchema>;
type DependentFormValues = z.infer<typeof dependentSchema>;

// --- Helper: Test Form Component ---
const TestFormContainer = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <Card className="w-full">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

// --- Test Case 1: Simplest Implementation ---
function BasicDatePickerForm() {
    const { toast } = useToast();
    const form = useForm<BaseFormValues>({
        resolver: zodResolver(baseSchema),
        defaultValues: { eventDate: new Date() },
    });

    const onSubmit = (data: BaseFormValues) => {
        toast({ title: "Form 1 Submitted", description: `Date: ${data.eventDate.toLocaleDateString()}` });
    };

    return (
        <TestFormContainer title="Test 1: Basic Date Picker" description="A form with only a date picker. This should always work.">
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
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </TestFormContainer>
    );
}

// --- Test Case 2: Date Picker with an Independent Effect ---
function DatePickerWithIndependentEffect() {
    const { toast } = useToast();
    const [fetchedData, setFetchedData] = useState<string | null>(null);
    const form = useForm<DependentFormValues>({
        resolver: zodResolver(dependentSchema),
        defaultValues: { eventDate: new Date(), category: "music" },
    });
    
    const watchedCategory = form.watch("category");

    useEffect(() => {
        setFetchedData(`Data fetched for category: ${watchedCategory}`);
    }, [watchedCategory]);

    const onSubmit = (data: DependentFormValues) => {
        toast({ title: "Form 2 Submitted", description: `Date: ${data.eventDate.toLocaleDateString()}, Category: ${data.category}` });
    };

    return (
        <TestFormContainer title="Test 2: With Independent useEffect" description="The effect ONLY watches the 'Category' field. The date picker should not be affected.">
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
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="music">Music</SelectItem><SelectItem value="art">Art</SelectItem></SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {fetchedData && <div className="p-4 bg-muted rounded-md"><p className="text-sm text-muted-foreground">{fetchedData}</p></div>}
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </TestFormContainer>
    );
}

// --- Test Case 3: Replicating the Failing Scenario ---
function DatePickerWithCombinedEffect() {
    const { toast } = useToast();
    const [fetchedData, setFetchedData] = useState<string | null>(null);
    const form = useForm<DependentFormValues>({
        resolver: zodResolver(dependentSchema),
        defaultValues: { eventDate: new Date(), category: "music" },
    });
    
    const watchedDate = form.watch("eventDate");
    const watchedCategory = form.watch("category");

    useEffect(() => {
        setFetchedData(`Data fetched for ${watchedCategory} on ${watchedDate?.toLocaleDateString()}`);
    }, [watchedDate, watchedCategory]);

    const onSubmit = (data: DependentFormValues) => {
        toast({ title: "Form 3 Submitted", description: `Date: ${data.eventDate.toLocaleDateString()}, Category: ${data.category}` });
    };

    return (
        <TestFormContainer title="Test 3: Replicating the Conflict" description="The effect watches BOTH the date and category. This is identical to the failing forms.">
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
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="music">Music</SelectItem><SelectItem value="art">Art</SelectItem></SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {fetchedData && <div className="p-4 bg-muted rounded-md"><p className="text-sm text-muted-foreground">{fetchedData}</p></div>}
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </TestFormContainer>
    );
}


// --- Main Page ---
export default function DatePickerTestPage() {
  return (
    <div className="flex flex-col gap-8">
      <BasicDatePickerForm />
      <DatePickerWithIndependentEffect />
      <DatePickerWithCombinedEffect />
    </div>
  );
}
