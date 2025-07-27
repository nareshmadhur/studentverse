"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, GraduationCap, Users, UserCheck, CalendarDays, DollarSign, CreditCard } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-headline font-semibold">StudentVerse</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/students")}
                tooltip="Students"
              >
                <Link href="/students">
                  <Users />
                  <span>Students</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/lessons")}
                tooltip="Lessons"
              >
                <Link href="/lessons">
                  <BookOpenCheck />
                  <span>Lessons</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/enrollments")}
                tooltip="Enrollments"
              >
                <Link href="/enrollments">
                  <UserCheck />
                  <span>Enrollments</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/classes")}
                tooltip="Classes"
              >
                <Link href="/classes">
                  <CalendarDays />
                  <span>Classes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/fees")}
                tooltip="Fees"
              >
                <Link href="/fees">
                  <DollarSign />
                  <span>Fees</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/payments")}
                tooltip="Payments"
              >
                <Link href="/payments">
                  <CreditCard />
                  <span>Payments</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* You can add header content here if needed, like a search bar */}
          </div>
        </header>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
