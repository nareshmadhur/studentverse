
"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePickerWithPresets } from "@/components/ui/date-range-picker-with-presets";
import { DateRange } from "react-day-picker";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { getBillingSummary, BillingSummary } from "@/lib/actions/billing";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrencySymbol } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertCircle, ArrowRight, User } from "lucide-react";
import StudentStatement from "@/components/billing/student-statement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSearchParams, useRouter } from 'next/navigation';

function BillingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const statementStudentId = searchParams.get('statementStudentId');
  const [isStatementOpen, setStatementOpen] = useState(!!statementStudentId);

  useEffect(() => {
    setStatementOpen(!!statementStudentId);
  }, [statementStudentId]);

  const onStatementOpenChange = (open: boolean) => {
    setStatementOpen(open);
    if (!open) {
      router.push('/billing');
    }
  }

  const fetchSummary = async (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return;
    setLoading(true);
    try {
      const summaryData = await getBillingSummary(range);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to fetch billing summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(dateRange);
  }, [dateRange]);

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
          Billing
        </h1>
        <div className="flex items-center gap-2">
           <label htmlFor="date-range" className="text-sm font-medium sr-only">Date Range</label>
            <DateRangePickerWithPresets
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
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                  <CardHeader>
                      <CardTitle className="text-base font-medium text-muted-foreground">Revenue Accrued</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold text-foreground">{getCurrencySymbol('USD')}{summary.totalAccrued.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total value of all classes in the period.</p>
                  </CardContent>
              </Card>
              <Card className="bg-muted/30">
                  <CardHeader>
                      <CardTitle className="text-base font-medium text-muted-foreground">Revenue Realized</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold text-green-600">{getCurrencySymbol('USD')}{summary.totalRealized.toFixed(2)}</p>
                       <p className="text-xs text-muted-foreground">Total payments received in the period.</p>
                  </CardContent>
              </Card>
               <Card className="bg-muted/30">
                  <CardHeader>
                      <CardTitle className="text-base font-medium text-muted-foreground">Outstanding</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-3xl font-bold text-destructive">{getCurrencySymbol('USD')}{summary.totalOutstanding.toFixed(2)}</p>
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
                  const currentCurrencySymbol = getCurrencySymbol(details.currencyCode);
                  return (
                    <TableRow key={details.studentId}>
                      <TableCell className="font-medium">{details.studentName}</TableCell>
                      <TableCell className="text-right font-semibold">{currentCurrencySymbol}{details.totalBilled.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-600">{currentCurrencySymbol}{details.totalPaid.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">{currentCurrencySymbol}{details.balance.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                       <TableCell className="text-right">
                        {details.hasBillingIssues && (
                           <Link href={`/fees?studentId=${details.studentId}&openDialog=true`}>
                              <Button variant="destructive" size="sm">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Fix Fee
                              </Button>
                           </Link>
                        )}
                         <Dialog open={isStatementOpen && statementStudentId === details.studentId} onOpenChange={onStatementOpenChange}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => router.push(`/billing?statementStudentId=${details.studentId}`)}>View Statement</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                                <DialogHeader>
                                    <DialogTitle>Statement for {details.studentName}</DialogTitle>
                                </DialogHeader>
                                <div className="overflow-y-auto -mx-6 px-6">
                                    {statementStudentId && dateRange && <StudentStatement studentId={statementStudentId} dateRange={dateRange} />}
                                </div>
                            </DialogContent>
                        </Dialog>

                         <Link href={`/students?id=${details.studentId}`} passHref>
                           <Button variant="ghost" size="icon">
                             <User className="h-4 w-4" />
                           </Button>
                         </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
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

export default function BillingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BillingPageContent />
        </Suspense>
    )
}
