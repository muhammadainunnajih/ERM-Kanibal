
import React from 'react';
import { LogOut, Bell } from 'lucide-react';
import { StaffUser } from '../types';

interface HeaderProps {
  currentTime: Date;
  onLogout: () => void;
  currentUser: StaffUser;
}

export const Header: React.FC<HeaderProps> = ({ currentTime, onLogout, currentUser }) => {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sistem Rekam Medis Elektronik</h2>
        <p className="text-sm text-gray-500">Kelola data pasien dan riwayat medis dengan mudah</p>
      </div>

      <div className="flex items-center space-x-8">
        <div className="flex flex-col items-end">
          <span className="text-xl font-mono font-bold text-gray-800">{formatTime(currentTime)}</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">{formatDate(currentTime)}</span>
        </div>

        <div className="h-10 w-px bg-gray-200" />

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="flex items-center space-x-3 pl-2">
            <div className="text-right flex flex-col">
              <span className="text-sm font-bold text-gray-900 leading-none mb-1">{currentUser.username}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{currentUser.role}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
               <img src={currentUser.photo || "https://i.pravatar.cc/150"} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-100 active:scale-95"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
