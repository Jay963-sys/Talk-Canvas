import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Talk Canvas Gallery",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-line bg-paper">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <Link href="/admin" className="display text-lg font-medium">
            Talk Canvas{" "}
            <span className="display-italic text-accent">Admin</span>
          </Link>
          <AdminNav />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
