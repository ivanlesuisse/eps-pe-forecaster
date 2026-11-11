import Sidebar from "@/components/Sidebar";
import { WealthProvider } from "@/components/WealthProvider";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WealthProvider>
      <div className="wealth-shell">
        <Sidebar />
        <main className="wealth-main">{children}</main>
      </div>
    </WealthProvider>
  );
}
