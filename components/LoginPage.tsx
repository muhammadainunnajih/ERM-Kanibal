
import React, { useState } from 'react';
import { Heart, ArrowLeft, Mail, User, ShieldCheck, Phone, CheckCircle2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { StaffUser } from '../types';

interface LoginPageProps {
  onLogin: (user: StaffUser) => void;
  clinicName: string;
  clinicLogo?: string;
  registeredUsers: StaffUser[];
}

type AuthView = 'login' | 'forgot' | 'register' | 'success';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, clinicName, clinicLogo, registeredUsers }) => {
  const [view, setView] = useState<AuthView>('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Registration State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    role: 'Perawat' as StaffUser['role'],
    phone: ''
  });

  // Success Message State
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Check against registered users
    const user = registeredUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Username atau Password salah. Silakan coba lagi.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Link pemulihan kata sandi telah dikirim ke email terdaftar Anda.');
    setView('success');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Pendaftaran berhasil! Akun Anda sedang ditinjau oleh Administrator. Mohon tunggu konfirmasi via email.');
    setView('success');
  };

  const renderContent = () => {
    if (view === 'success') {
      return (
        <div className="w-full py-10 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">Berhasil!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-10 px-4">
            {successMsg}
          </p>
          <button 
            onClick={() => setView('login')}
            className="w-full bg-[#2563eb] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
          >
            Kembali ke Login
          </button>
        </div>
      );
    }

    if (view === 'forgot') {
      return (
        <div className="w-full animate-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setView('login')}
            className="mb-8 flex items-center text-gray-400 hover:text-gray-900 transition-colors text-sm font-bold"
          >
            <ArrowLeft size={18} className="mr-2" /> Kembali
          </button>
          <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Lupa Password?</h2>
          <p className="text-gray-500 text-sm mb-8">Masukkan username atau email Anda untuk mendapatkan instruksi pemulihan.</p>
          
          <form onSubmit={handleForgotSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username / Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="text"
                  placeholder="admin@kliniksehat.com"
                  className="w-full pl-12 pr-4 py-4 bg-[#eef4ff] border-none rounded-xl outline-none text-gray-800 font-medium transition-all focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              Kirim Instruksi
            </button>
          </form>
        </div>
      );
    }

    if (view === 'register') {
      return (
        <div className="w-full animate-in slide-in-from-right-4 duration-300">
          <button 
            onClick={() => setView('login')}
            className="mb-6 flex items-center text-gray-400 hover:text-gray-900 transition-colors text-sm font-bold"
          >
            <ArrowLeft size={18} className="mr-2" /> Kembali
          </button>
          <h2 className="text-xl font-black text-gray-900 mb-1 uppercase tracking-tight">Daftar Akun Staff</h2>
          <p className="text-gray-500 text-sm mb-8">Lengkapi formulir untuk mengajukan akses sistem Klinik Sehat.</p>
          
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  required
                  type="text"
                  value={regData.name}
                  onChange={e => setRegData({...regData, name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-[#eef4ff] border-none rounded-xl outline-none text-gray-800 font-medium transition-all"
                  placeholder="Ahmad Subarjo"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Kerja</label>
                <input 
                  required
                  type="email"
                  value={regData.email}
                  onChange={e => setRegData({...regData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-[#eef4ff] border-none rounded-xl outline-none text-gray-800 font-medium transition-all"
                  placeholder="email@klinik.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Posisi / Role</label>
                <select 
                  value={regData.role}
                  onChange={e => setRegData({...regData, role: e.target.value as StaffUser['role']})}
                  className="w-full px-4 py-3 bg-[#eef4ff] border-none rounded-xl outline-none text-gray-800 font-medium"
                >
                  <option value="Dokter">Dokter</option>
                  <option value="Perawat">Perawat</option>
                  <option value="Apoteker">Apoteker</option>
                  <option value="Kasir">Kasir</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  required
                  type="tel"
                  value={regData.phone}
                  onChange={e => setRegData({...regData, phone: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-[#eef4ff] border-none rounded-xl outline-none text-gray-800 font-medium"
                  placeholder="0812..."
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3 mb-6">
              <ShieldCheck className="text-blue-600 mt-1 flex-shrink-0" size={18} />
              <p className="text-[10px] text-blue-800 font-medium leading-relaxed uppercase tracking-tight">
                Data Anda akan dikirim ke administrator untuk proses verifikasi kredensial.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              Ajukan Pendaftaran
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="w-full animate-in fade-in duration-500 flex flex-col items-center">
        {/* Branding Icon Box */}
        <div className="w-20 h-20 bg-[#2563eb] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-100 overflow-hidden">
          {clinicLogo ? (
            <img src={clinicLogo} alt="Clinic Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="border-2 border-white/30 p-1.5 rounded-lg flex items-center justify-center">
              <Heart size={32} fill="currentColor" />
            </div>
          )}
        </div>

        {/* Header Text */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1 text-center">{clinicName}</h1>
        <p className="text-gray-500 text-sm mb-10">Silakan login untuk melanjutkan</p>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#eef4ff] border-none rounded-xl outline-none text-gray-800 font-medium transition-all focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-[#eef4ff] border-none rounded-xl outline-none text-gray-800 font-medium transition-all focus:ring-2 focus:ring-blue-200"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-[-10px]">
            <button 
              type="button" 
              onClick={() => setView('forgot')}
              className="text-blue-500 text-sm font-medium hover:underline"
            >
              Lupa Password?
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              Login
            </button>
            <button 
              type="button"
              onClick={() => setView('register')}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-xl transition-all"
            >
              Belum punya akun? Daftar
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[440px] p-10 border border-gray-100 flex flex-col items-center">
        {renderContent()}
      </div>
    </div>
  );
};
