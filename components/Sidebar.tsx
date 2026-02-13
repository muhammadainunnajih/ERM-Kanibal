
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  BriefcaseMedical, 
  Wallet, 
  CalendarDays, 
  Package, 
  BarChart3, 
  UserCog, 
  Settings,
  Activity,
  Headphones
} from 'lucide-react';
import { MenuKey, StaffUser } from '../types';

interface SidebarProps {
  activeMenu: MenuKey;
  onMenuClick: (menu: MenuKey) => void;
  clinicName: string;
  clinicLogo?: string;
  userRole: StaffUser['role'];
  onContactClick: () => void;
}

interface MenuItem {
  key: MenuKey;
  label: string;
  icon: React.ElementType;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'data-pasien', label: 'Data Pasien', icon: Users },
  { key: 'data-dokter', label: 'Data Dokter', icon: UserRound },
  { key: 'apotek', label: 'Apotek', icon: BriefcaseMedical },
  { key: 'kasir', label: 'Kasir', icon: Wallet },
  { key: 'jadwal', label: 'Jadwal & Antrian', icon: CalendarDays },
  { key: 'inventaris', label: 'Inventaris', icon: Package },
  { key: 'laporan', label: 'Laporan', icon: BarChart3 },
  { key: 'manajemen-user', label: 'Manajemen User', icon: UserCog },
  { key: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

const ROLE_PERMISSIONS: Record<StaffUser['role'], MenuKey[]> = {
  'Administrator': ['dashboard', 'data-pasien', 'data-dokter', 'apotek', 'kasir', 'jadwal', 'inventaris', 'laporan', 'manajemen-user', 'pengaturan'],
  'Dokter': ['dashboard', 'data-pasien', 'data-dokter', 'jadwal', 'laporan', 'pengaturan'],
  'Perawat': ['dashboard', 'data-pasien', 'jadwal'],
  'Apoteker': ['dashboard', 'apotek', 'inventaris'],
  'Kasir': ['dashboard', 'kasir', 'laporan']
};

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuClick, clinicName, clinicLogo, userRole, onContactClick }) => {
  const allowedMenus = ROLE_PERMISSIONS[userRole] || ['dashboard'];
  const filteredMenuItems = MENU_ITEMS.filter(item => allowedMenus.includes(item.key));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full hidden md:flex">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 overflow-hidden">
          {clinicLogo ? <img src={clinicLogo} alt="Clinic Logo" className="w-full h-full object-cover" /> : <Activity size={24} />}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">{clinicName}</h1>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">EMR System</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto pb-8">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onMenuClick(item.key)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
              <span className="text-[14px] font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <div className="bg-blue-600 text-white rounded-[24px] p-5 shadow-xl shadow-blue-100 relative overflow-hidden group">
          <div className="absolute top-[-10%] right-[-10%] w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
          <div className="relative z-10">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <Headphones size={18} />
            </div>
            <p className="text-sm font-black mb-1 uppercase tracking-tight leading-tight">Butuh Bantuan?</p>
            <p className="text-[10px] opacity-80 mb-4 leading-relaxed">Hubungi Technical Support kami.</p>
            <button 
              onClick={onContactClick}
              className="w-full bg-white text-blue-600 font-black text-[10px] py-2.5 rounded-xl uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg active:scale-95"
            >
              Hubungi Admin
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
