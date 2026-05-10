'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  InboxIcon, 
  UserGroupIcon, 
  DocumentMagnifyingGlassIcon, 
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import LogoutButton from '@/components/LogoutButton';

export default function SidebarAdmin() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Permohonan NSN', href: '/admin/permohonan', icon: InboxIcon },
    { name: 'Tugas Kodifikasi', href: '/admin/pengerjaan', icon: InboxIcon },
    { name: 'Validasi NSN', href: '/admin/validasi', icon: InboxIcon },
    { name: 'Monitoring Track Record', href: '/admin/monitoring', icon: DocumentMagnifyingGlassIcon },
    { name: 'Data Pegawai', href: '/admin/pegawai', icon: UserGroupIcon },
    { name: 'Laporan Statistik', href: '/admin/statistik', icon: ChartBarIcon },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1A1A1A] text-white flex flex-col shadow-2xl z-50">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-bold text-[#800000] tracking-tighter uppercase">Panel Kontrol</h2>
        <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Puskod Kemhan</p>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#800000] text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
              <span className="text-sm font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <LogoutButton variant="sidebar" />
      </div>
    </aside>
  );
}