
'use client';

import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, createContext, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Environment } from "@/lib/firebase";

export const AppContext = createContext<{
  environment: Environment;
  setEnvironment: (env: Environment) => void;
}>({
  environment: 'development',
  setEnvironment: () => {},
});


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [environment, setEnvironment] = useState<Environment>('development');

  useEffect(() => {
    const storedEnv = localStorage.getItem('tutoraid-env');
    if (storedEnv && ['development', 'pre-prod', 'production'].includes(storedEnv)) {
      setEnvironment(storedEnv as Environment);
    }
  }, []);

  const appContextValue = useMemo(() => ({
    environment,
    setEnvironment,
  }), [environment]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.providerData.some(p => p.providerId === 'password') && !user.emailVerified) {
       router.push('/login');
    }

  }, [user, loading, router]);

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

  return (
    <AppContext.Provider value={appContextValue}>
      <AppShell>{children}</AppShell>
    </AppContext.Provider>
  );
}
