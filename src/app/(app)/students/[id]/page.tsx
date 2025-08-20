
"use client";

import StudentProfile from "@/components/students/student-profile";

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <StudentProfile id={id} />;
}
