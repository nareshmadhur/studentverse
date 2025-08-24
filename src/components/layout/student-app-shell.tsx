
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, CalendarDays, FileText, LogOut } from "lucide-react";
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

export function StudentAppShell({ children }: { children: React.ReactNode }) {
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
                isActive={isActive("/student/dashboard")}
                tooltip="Dashboard"
              >
                <Link href="/student/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/student/classes")}
                tooltip="My Classes"
              >
                <Link href="/student/classes">
                  <CalendarDays />
                  <span>My Classes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/student/billing")}
                tooltip="Billing"
              >
                <Link href="/student/billing">
                  <FileText />
                  <span>Billing</span>
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
      <main className="flex-1">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <p className="font-semibold text-muted-foreground">Student Portal</p>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-screen-2xl">
              {children}
            </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
