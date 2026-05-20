import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Admin Sign in — Talk Canvas Gallery",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}
