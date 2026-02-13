
import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, UserCog, Mail, Phone, MoreHorizontal, 
  Search, UserPlus, Pencil, Trash2, X, Check, Camera,
  Shield, AlertCircle, Clock, User as UserIcon, Lock,
  Eye, EyeOff
} from 'lucide-react';
import { StaffUser } from '../types';

interface UserManagementProps {
  users: StaffUser[];
  onAdd: (user: StaffUser) => void;
  onUpdate: (user: StaffUser) => void;
  onDelete: (id: string) => void;
}

const ROLES: StaffUser['role'][] = [
  'Administrator',
  'Dokter',
  'Perawat',
  'Apoteker',
  'Kasir'
];

export const UserManagement: React.FC<UserManagementProps> = ({ 
  users, onAdd, onUpdate, onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<StaffUser>>({
    name: '',
    username: '',
    password: '',
    role: 'Perawat',
    email: '',
    phone: '',
    status: 'Offline',
    lastActive: 'Baru saja'
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: StaffUser) => {
    setShowPassword(false);
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'Perawat',
        email: '',
        phone: '',
        status: 'Offline',
        lastActive: 'Baru saja',
        photo: ''
      });
    }
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdate({ ...editingUser, ...formData } as StaffUser);
    } else {
      const newUser: StaffUser = {
        ...formData,
        id: `u-${Date.now()}`,
        status: 'Offline',
        lastActive: 'Baru saja'
      } as StaffUser;
      onAdd(newUser);
    }
    setIsModalOpen(false);
  };

  const executeDelete = () => {
    if (userToDelete) {
      onDelete(userToDelete);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen User</h2>
          <p className="text-gray-500">Kelola akses staff dan kredensial login Klinik Sehat.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari staff atau username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <UserPlus size={20} />
            <span className="hidden sm:inline">Tambah Staff</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all">
            <div className="flex items-center space-x-6">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 font-bold overflow-hidden border border-gray-100 shadow-inner group-hover:scale-105 transition-transform">
                   {user.photo ? (
                     <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     <UserCog size={32} />
                   )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${user.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-black text-gray-900 text-lg leading-tight">{user.name}</h4>
                  <span className="text-[10px] font-bold text-gray-400">(@{user.username})</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    user.role === 'Administrator' ? 'bg-red-50 text-red-600' :
                    user.role === 'Dokter' ? 'bg-blue-50 text-blue-600' :
                    user.role === 'Apoteker' ? 'bg-purple-50 text-purple-600' :
                    user.role === 'Kasir' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
                  <div className="flex items-center space-x-1.5 text-gray-500">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-xs font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-gray-500">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-xs font-medium">{user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-600">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Akses Aktif</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between md:justify-end space-x-8 mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-end">
                  <Clock size={10} className="mr-1" /> Aktivitas
                </p>
                <p className="text-xs font-bold text-gray-900">{user.lastActive}</p>
              </div>
              
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handleOpenModal(user)}
                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit Staff & Login"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => { setUserToDelete(user.id); setIsDeleteModalOpen(true); }}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Hapus Staff"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
             <UserCog size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold">Staff tidak ditemukan.</p>
          </div>
        )}
      </div>

      {/* Modal User Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{editingUser ? 'Update Staff' : 'Daftarkan Staff Baru'}</h3>
                <p className="text-sm text-gray-500 mt-1">Lengkapi informasi profil dan kredensial login.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-6 overflow-y-auto max-h-[80vh]">
              {/* Photo Upload */}
              <div className="flex flex-col items-center space-y-2">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-[24px] bg-gray-50 border-4 border-gray-100 shadow-inner flex items-center justify-center overflow-hidden cursor-pointer relative group"
                >
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={28} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-black uppercase tracking-widest text-center">Ubah<br/>Foto</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 transition-all"
                      placeholder="Contoh: Ahmad Subarjo"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Role / Jabatan</label>
                    <select 
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 appearance-none"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 space-y-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center">
                    <Shield size={12} className="mr-1.5" /> Kredensial Login
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          required
                          type="text" 
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 transition-all shadow-sm"
                          placeholder="username_staff"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          required={!editingUser}
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full pl-11 pr-12 py-3.5 bg-white border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-800 transition-all shadow-sm"
                          placeholder={editingUser ? "••••••••" : "Masukkan password"}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Staff</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 transition-all"
                        placeholder="staff@klinik.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-gray-800 transition-all"
                        placeholder="0812..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-sm text-gray-400">BATAL</button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center justify-center space-x-2 transition-all"
                >
                  <Check size={20} />
                  <span>{editingUser ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN STAFF'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Hapus User?</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Akses staff ini ke sistem EMR akan dihentikan dan data akun akan dihapus permanen.
              </p>
            </div>
            <div className="flex p-6 bg-gray-50/50 space-x-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest"
              >
                Batal
              </button>
              <button 
                onClick={executeDelete}
                className="flex-[1.5] py-4 bg-red-600 text-white text-xs font-black rounded-2xl hover:bg-red-700 shadow-xl shadow-red-100 uppercase tracking-widest"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
