
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Users, CalendarDays, DollarSign, CreditCard, Key, FileText, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();


  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };
  
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/login');
    } catch (error) {
       toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary">
              <GraduationCap className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-headline font-semibold">Tutoraid</h1>
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
                isActive={isActive("/payments")}
                tooltip="Payments"
              >
                <Link href="/payments">
                  <CreditCard />
                  <span>Payments</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/billing")}
                tooltip="Billing"
              >
                <Link href="/billing">
                  <FileText />
                  <span>Billing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin")}
                tooltip="Admin"
              >
                <Link href="/admin">
                  <Key />
                  <span>Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
         <SidebarFooter>
            <SidebarSeparator />
            <div className="p-2 flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col text-sm overflow-hidden">
                        <span className="font-semibold text-foreground truncate">{user?.email}</span>
                    </div>
                </div>
                 <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1 h-screen">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 shrink-0 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* You can add header content here if needed, like a search bar */}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-screen-2xl h-full">
              {children}
            </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
