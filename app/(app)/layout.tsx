import { redirect } from "next/navigation";
import { getProfile } from "@/actions/auth";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getProfile();
  if (!result.success) redirect("/login");

  const profile = result.data;

  return (
    <div className="flex min-h-full flex-col bg-bg">
      <main className="flex flex-1 flex-col">{children}</main>
      <div className="sticky bottom-0 z-10 bg-bg pb-safe">
        <BottomNav role={profile.role} />
        <div className="flex justify-center pb-2">
          <div className="h-1 w-32 rounded-full bg-text/30" />
        </div>
      </div>
    </div>
  );
}
