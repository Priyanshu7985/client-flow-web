import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Update password", robots: { index: false } };

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
