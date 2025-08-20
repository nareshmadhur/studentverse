
"use client";

import StudentProfile from "@/components/students/student-profile";

export default function StudentProfilePage({ params: { id } }: { params: { id: string } }) {
  return <StudentProfile id={id} />;
}
