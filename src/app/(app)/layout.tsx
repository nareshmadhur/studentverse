
'use client';

import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.providerData.some(p => p.providerId === 'password') && !user.emailVerified) {
       router.push('/login');
       return;
    }

    const checkStudentRole = async () => {
      // Students have a document in the `dev_students` collection with their email.
      // Teachers do not. This is how we differentiate roles.
      const studentDocRef = doc(db, "dev_students", user.uid);
      const studentDocSnap = await getDoc(studentDocRef);

      if (studentDocSnap.exists()) {
        // User is a student
        if (!pathname.startsWith('/student')) {
          router.push('/student/dashboard');
        }
      } else {
        // User is a teacher
        if (pathname.startsWith('/student')) {
          router.push('/students');
        }
      }
    };

    checkStudentRole();

  }, [user, loading, router, pathname]);

  if (loading || !user || (user.providerData.some(p => p.providerId === 'password') && !user.emailVerified)) {
    return (
       <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  // This check prevents showing the teacher shell to a student and vice-versa
  if (pathname.startsWith('/student')) {
    // A separate layout will handle the student shell
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
