import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth"; // Adjust path if needed
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Admin Sign in — Talk Canvas Gallery",
};

export default async function LoginPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const session = await verifySession(token);

    if (session) {
      redirect("/admin");
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}
