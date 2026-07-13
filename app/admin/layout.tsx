import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
// Import your non-blocking session check
import { getSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Talk Canvas Gallery",
};

// 1. Make the layout async
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Fetch the session (returns null/false if not logged in)
  const session = await getSession();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link href="/admin" className="display text-lg font-medium">
            Talk Canvas{" "}
            <span className="display-italic text-accent">Admin</span>
          </Link>

          {/* 3. Conditionally render the nav */}
          {session && <AdminNav />}
        </div>
      </header>

      {/* 4. Global Admin Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
