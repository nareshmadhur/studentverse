
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";
import { getBillingSummary, BillingSummary } from "@/lib/actions/billing";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const fetchSummary = async (range: DateRange) => {
    if (!range.from || !range.to) return;
    setLoading(true);
    try {
      const summaryData = await getBillingSummary(range);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to fetch billing summary:", error);
      // Optionally, show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange) {
      fetchSummary(dateRange);
    }
  }, [dateRange]);

  const currencySymbol = getCurrencySymbol(summary?.studentDetails?.[0]?.currencyCode || 'USD');

  const getPaymentStatus = (details: BillingSummary['studentDetails'][0]): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (details.totalBilled <= 0) return { text: "No Charges", variant: "outline" };
    if (details.balance <= 0) return { text: "Paid", variant: "default" };
    if (details.totalPaid > 0 && details.balance > 0) return { text: "Partially Paid", variant: "secondary" };
    return { text: "Unpaid", variant: "destructive" };
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-headline font-bold text-foreground">
          Billing Overview
        </h1>
        <div className="flex items-center gap-2">
           <label htmlFor="date-range" className="text-sm font-medium">Date Range</label>
            <DateRangePicker
              id="date-range"
              range={dateRange}
              onRangeChange={setDateRange}
              className="w-full sm:w-auto"
            />
        </div>
      </div>
     
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : summary && (
        <Card>
          <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>
                Summary for the period from {dateRange?.from ? format(dateRange.from, 'PPP') : ''} to {dateRange?.to ? format(dateRange.to, 'PPP') : ''}
              </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                  <CardHeader>
                      <CardTitle className="text-base font-medium text-muted-foreground">Revenue Accrued</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold text-foreground">{currencySymbol}{summary.totalAccrued.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total value of all classes in the period.</p>
                  </CardContent>
              </Card>
              <Card className="bg-muted/30">
                  <CardHeader>
                      <CardTitle className="text-base font-medium text-muted-foreground">Revenue Realized</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold text-green-600">{currencySymbol}{summary.totalRealized.toFixed(2)}</p>
                       <p className="text-xs text-muted-foreground">Total payments received in the period.</p>
                  </CardContent>
              </Card>
               <Card className="bg-muted/30">
                  <CardHeader>
                      <CardTitle className="text-base font-medium text-muted-foreground">Outstanding</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold text-destructive">{currencySymbol}{summary.totalOutstanding.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total amount pending from students.</p>
                  </CardContent>
              </Card>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Breakdown</CardTitle>
          <CardDescription>Details of charges and payments for each student in the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Billed</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 float-right" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 float-right" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 float-right" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : summary?.studentDetails && summary.studentDetails.length > 0 ? (
                summary.studentDetails.map((details) => {
                  const status = getPaymentStatus(details);
                  return (
                    <TableRow key={details.studentId}>
                      <TableCell className="font-medium">{details.studentName}</TableCell>
                      <TableCell className="text-right">{currencySymbol}{details.totalBilled.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-600">{currencySymbol}{details.totalPaid.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">{currencySymbol}{details.balance.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                       <TableCell className="text-right">
                        {details.hasBillingIssues && (
                           <Link href={`/fees?studentId=${details.studentId}&openDialog=true`}>
                              <Button variant="destructive" size="sm">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Fix Missing Fee
                              </Button>
                           </Link>
                        )}
                         <Link href={`/students/${details.studentId}`} passHref>
                           <Button variant="ghost" size="icon">
                             <ArrowRight className="h-4 w-4" />
                           </Button>
                         </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No student activity in this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format date for display, if needed elsewhere
function format(date: Date, formatString: string): string {
    const options: Intl.DateTimeFormatOptions = {};
    if (formatString.includes('PPP')) {
        options.dateStyle = 'long';
    }
    return new Intl.DateTimeFormat('en-US', options).format(date);
}
