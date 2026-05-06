import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen overflow-x-clip bg-transparent">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] min-w-0">
        <AppSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col p-4 md:p-5 xl:p-6">
          <AppHeader
            userLabel={user?.email ?? "Painel demo"}
            isSupabaseReady={isSupabaseConfigured()}
            isAuthenticated={Boolean(user)}
          />
          <main className="min-w-0 flex-1 px-0 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
