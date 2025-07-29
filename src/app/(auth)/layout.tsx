
import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-headline font-semibold">StudentVerse</h1>
          </div>
        {children}
      </div>
    </div>
  );
}
