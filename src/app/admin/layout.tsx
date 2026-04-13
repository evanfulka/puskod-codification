import SidebarAdmin from '@/components/SidebarAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarAdmin />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}