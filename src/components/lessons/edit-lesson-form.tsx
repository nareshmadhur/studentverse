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
import { Lesson } from "@/lib/definitions";
import { Textarea } from "@/components/ui/textarea";

const lessonSchema = z.object({
  lesson_name: z.string().min(1, "Lesson name is required"),
  lesson_type: z.enum(["1-1", "group"]),
  description: z.string().min(1, "Description is required"),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

export default function EditLessonForm({
  setOpen,
  lesson,
}: {
  setOpen: (open: boolean) => void;
  lesson: Lesson;
}) {
  const { toast } = useToast();
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      lesson_name: lesson.lesson_name,
      lesson_type: lesson.lesson_type,
      description: lesson.description,
    },
  });

  const onSubmit = async (data: LessonFormValues) => {
    try {
      const lessonDocRef = doc(db, "lessons", lesson.lesson_id);
      await updateDoc(lessonDocRef, {
        ...data,
        updated_at: serverTimestamp(),
      });
      toast({
        title: "Lesson Updated",
        description: `${data.lesson_name} has been successfully updated.`,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({
        title: "Error",
        description: "There was an error updating the lesson. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="lesson_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter lesson name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lesson_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lesson type" />
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter lesson description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
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
