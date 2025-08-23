
"use client";

import { useEffect, useState, useMemo } from "react";
import type { Student, Class, Fee, Payment } from "@/lib/definitions";
import { getStatementData, Statement, StatementItem } from "@/lib/actions/billing";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Badge } from "../ui/badge";
import { getCurrencySymbol } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

export default function StudentStatement({ studentId, dateRange }: { studentId: string; dateRange: DateRange }) {
  const [statement, setStatement] = useState<Statement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateStatement = async () => {
      if (!studentId || !dateRange.from || !dateRange.to) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getStatementData(studentId, dateRange);
        setStatement(data);
      } catch (err) {
        console.error("Error generating statement:", err);
        setError("Failed to generate the statement. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generateStatement();
  }, [studentId, dateRange]);
  
  const studentCurrencySymbol = useMemo(() => {
    if (!statement) return '';
    return getCurrencySymbol(statement.student.currencyCode);
  }, [statement]);

  const totalAmountDue = useMemo(() => {
    return statement?.items.reduce((acc, item) => acc + item.charge, 0) || 0;
  }, [statement]);
  
  const totalPayments = useMemo(() => {
    return statement?.payments.reduce((acc, payment) => acc + payment.amount, 0) || 0;
  }, [statement]);

  const balance = useMemo(() => {
    return totalAmountDue - totalPayments;
  }, [totalAmountDue, totalPayments]);


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!statement) {
    return null;
  }
  
  return (
    <Card className="mt-0 border-0 shadow-none">
      <CardHeader className="pt-0">
        <CardDescription>
          For the period from {format(statement.dateRange.from, 'PPP')} to {format(statement.dateRange.to, 'PPP')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2 text-foreground">Classes Attended</h3>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Date</TableHead>
                <TableHead>Class Title</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead className="text-right">Charge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statement.items.map((item) => (
                <TableRow key={item.class.id}>
                  <TableCell>{format(new Date(item.class.scheduledDate), 'PPP')}</TableCell>
                  <TableCell>{item.class.title}</TableCell>
                  <TableCell>{item.class.discipline}</TableCell>
                  <TableCell className="text-right">
                    {getCurrencySymbol(item.fee?.currencyCode || '')}{item.charge.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {statement.items.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No classes attended in this period.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">Payments Received</h3>
         <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statement.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.transactionDate), 'PPP')}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.notes || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    {getCurrencySymbol(payment.currencyCode)}{payment.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {statement.payments.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No payments received in this period.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-end bg-muted/50 p-6 mt-6">
        <div className="grid grid-cols-1 gap-y-2 text-right">
            <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground">Total Charges:</span>
                <span className="font-semibold w-28 text-lg">{studentCurrencySymbol}{totalAmountDue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground">Total Payments:</span>
                <span className="font-semibold w-28 text-lg text-green-600">{studentCurrencySymbol}{totalPayments.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center gap-4 border-t pt-2 mt-2">
                <span className="text-foreground font-bold">Balance Due:</span>
                <span className="font-bold w-28 text-xl text-primary">{studentCurrencySymbol}{balance.toFixed(2)}</span>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}
