
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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";

const worldCurrencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona" },
    { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
    { code: "MXN", symbol: "$", name: "Mexican Peso" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
    { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
    { code: "KRW", symbol: "₩", name: "South Korean Won" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira" },
    { code: "RUB", symbol: "₽", name: "Russian Ruble" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "ZAR", symbol: "R", name: "South African Rand" },
];


const currencySchema = z.object({
  name: z.string().min(1, "Currency name is required"),
  code: z.string().min(3, "Code must be 3 characters").max(3, "Code must be 3 characters"),
  symbol: z.string().min(1, "Symbol is required"),
});

type CurrencyFormValues = z.infer<typeof currencySchema>;

export default function AddCurrencyForm() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

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

  const handleCurrencySelect = (currency: {name: string, code: string, symbol: string}) => {
    form.setValue("name", currency.name);
    form.setValue("code", currency.code);
    form.setValue("symbol", currency.symbol);
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Search Currency</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value
                            ? worldCurrencies.find(
                                (currency) => currency.name === field.value
                            )?.name
                            : "Select currency"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search currency..." />
                            <CommandList>
                                <CommandEmpty>No currency found.</CommandEmpty>
                                <CommandGroup>
                                {worldCurrencies.map((currency) => (
                                    <CommandItem
                                    key={currency.code}
                                    value={currency.name}
                                    onSelect={() => handleCurrencySelect(currency)}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        currency.name === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {currency.name} ({currency.code})
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4 text-sm text-muted-foreground p-4 border rounded-lg">
            <span>Code: <span className="font-bold text-foreground">{form.watch('code') || '...'}</span></span>
            <span>Symbol: <span className="font-bold text-foreground">{form.watch('symbol') || '...'}</span></span>
        </div>
        
        <Button type="submit" className="w-full" disabled={!form.watch('name')}>Add Currency</Button>
      </form>
    </Form>
  );
}
